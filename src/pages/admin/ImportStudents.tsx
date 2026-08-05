import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { Button } from '../../components/ui/button';
import {
  ArrowLeft,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, writeBatch, doc, limit, orderBy } from 'firebase/firestore';

interface ParsedStudent {
  fullName: string;
  parentName: string;
  contactNumber: string;
  email: string;
  gender: string;
  college: string;
  university: string;
  course: string;
  semester: string;
  universityRoll: string;
  universityRollNo: string;
  industrialRegNo: string;
  academicDetails?: string;
  importedAt?: string;
  status?: string;
  reason?: string;
}

interface ImportSkippedStudent extends ParsedStudent {
  reason: string;
}

interface ImportSummary {
  totalCount: number;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  importedStudents: ParsedStudent[];
  skippedStudents: ImportSkippedStudent[];
}

export default function ImportStudents() {
  const navigate = useNavigate();
  const { user, adminProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  // Firestore DB Imported Students List State
  const [databaseStudents, setDatabaseStudents] = useState<any[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);

  // Filter & Search & Pagination for Imported Students Table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Imported' | 'Duplicate' | 'Error'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const supportedColumns = [
    'Student Name',
    "Father's Name",
    'Mobile Number',
    'Email',
    'Gender',
    'College Name',
    'University Name',
    'Course',
    'Semester',
    'University Registration Number',
    'University Roll No',
    'Industrial Registration Number'
  ];

  // Fetch existing imported students from Firestore
  const fetchImportedStudents = async () => {
    try {
      setLoadingTable(true);
      const importedQuery = query(collection(db, 'importedStudents'), orderBy('importedAt', 'desc'));
      const snapshot = await getDocs(importedQuery);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDatabaseStudents(data);
    } catch (err) {
      console.error('Error fetching imported students:', err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchImportedStudents();
  }, []);

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Student Name': 'Aman Verma',
        "Father's Name": 'Rajesh Verma',
        'Mobile Number': '9876543210',
        'Email': 'aman@gmail.com',
        'Gender': 'Male',
        'College Name': 'Patna Science College',
        'University Name': 'Patna University',
        'Course': 'Web Development',
        'Semester': '3',
        'University Registration Number': 'PU12345678',
        'University Roll No': '2101501',
        'Industrial Registration Number': 'IND987654'
      },
      {
        'Student Name': 'Priya Sharma',
        "Father's Name": 'Suresh Sharma',
        'Mobile Number': '9876543211',
        'Email': 'priya@gmail.com',
        'Gender': 'Female',
        'College Name': 'Magadh Mahila College',
        'University Name': 'Patna University',
        'Course': 'Digital Marketing',
        'Semester': '2',
        'University Registration Number': 'PU12345679',
        'University Roll No': '2101502',
        'Industrial Registration Number': 'IND987655'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student_Template');
    XLSX.writeFile(workbook, 'InternMitra_Student_Import_Template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setParsedData([]);
    setErrorMsg('');
    setSuccessMsg('');
    setWarnings([]);

    if (!selectedFile) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) throw new Error("Could not read file data");

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (json.length < 2) {
          throw new Error("Excel sheet must contain a header row and at least one data row.");
        }

        const rawHeaders = json[0].map((h: any) => String(h || '').trim());

        const mappedStudents: ParsedStudent[] = [];
        const fileWarnings: string[] = [];

        const findColIndex = (names: string[]) => {
          return rawHeaders.findIndex((h) =>
            names.some((name) => h.toLowerCase() === name.toLowerCase())
          );
        };

        const nameIdx = findColIndex(['Student Name', 'Name', 'fullName', 'StudentName']);
        const parentIdx = findColIndex(["Father's Name", 'Father Name', 'Parent Name', 'parentName', 'FatherName']);
        const phoneIdx = findColIndex(['Mobile Number', 'Mobile', 'Phone', 'contactNumber', 'Phone Number', 'MobileNo']);
        const emailIdx = findColIndex(['Email', 'email', 'Email Address', 'EmailId']);
        const genderIdx = findColIndex(['Gender', 'gender', 'Sex']);
        const collegeIdx = findColIndex(['College Name', 'College', 'college']);
        const uniIdx = findColIndex(['University', 'university', 'University Name']);
        const courseIdx = findColIndex(['Course', 'Domain', 'Internship Domain', 'course', 'domain']);
        const semIdx = findColIndex(['Semester', 'semester', 'Year/Semester']);
        const rollIdx = findColIndex(['University Registration Number', 'Registration Number', 'Reg No', 'universityRoll', 'RegNo']);
        const rollNoIdx = findColIndex(['University Roll No', 'University Roll Number', 'Roll Number', 'Roll No', 'universityRollNo', 'RollNo']);
        const indIdx = findColIndex(['Industrial Registration Number', 'Industrial Reg No', 'industrialRegNo', 'IndustrialRegNo']);

        if (rollIdx === -1) fileWarnings.push("Missing University Registration Number column.");
        if (nameIdx === -1) fileWarnings.push("Missing Student Name column.");
        if (phoneIdx === -1) fileWarnings.push("Missing Mobile Number column.");
        if (emailIdx === -1) fileWarnings.push("Missing Email column.");

        setWarnings(fileWarnings);

        for (let r = 1; r < json.length; r++) {
          const row = json[r];
          if (!row || row.length === 0) continue;
          const hasData = row.some((val: any) => val !== null && val !== undefined && String(val).trim() !== '');
          if (!hasData) continue;

          const getVal = (idx: number) => {
            if (idx === -1 || idx >= row.length) return '';
            return String(row[idx] || '').trim();
          };

          mappedStudents.push({
            fullName: getVal(nameIdx),
            parentName: getVal(parentIdx),
            contactNumber: getVal(phoneIdx),
            email: getVal(emailIdx),
            gender: getVal(genderIdx),
            college: getVal(collegeIdx),
            university: getVal(uniIdx),
            course: getVal(courseIdx),
            semester: getVal(semIdx),
            universityRoll: getVal(rollIdx),
            universityRollNo: getVal(rollNoIdx),
            industrialRegNo: getVal(indIdx),
          });
        }

        if (mappedStudents.length === 0) {
          throw new Error("No valid student rows found in the uploaded sheet.");
        }

        setParsedData(mappedStudents);
      } catch (err: any) {
        setErrorMsg(err?.message || "Failed to parse Excel sheet. Check formatting.");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg("Failed to read file.");
      setLoading(false);
    };

    reader.readAsBinaryString(selectedFile);
  };

  const importStudentsClientSide = async (students: ParsedStudent[]) => {
    const importedRef = collection(db, "importedStudents");
    const usersRef = collection(db, "users");
    let importedCount = 0;
    let errorCount = 0;
    const importedStudents: ParsedStudent[] = [];
    const skippedStudents: ImportSkippedStudent[] = [];
    const seenRolls = new Set<string>();
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    const CHUNK_SIZE = 100;

    for (let i = 0; i < students.length; i += CHUNK_SIZE) {
      const chunk = students.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const student of chunk) {
        const roll = student.universityRoll.trim();
        const email = student.email.trim().toLowerCase();
        const phone = student.contactNumber.replace(/\D/g, '').slice(-10);

        if (!roll && !student.fullName) {
          errorCount += 1;
          skippedStudents.push({ ...student, reason: "Invalid Record - Missing Name and Roll Number", status: 'Error' });
          continue;
        }

        if (!roll) {
          errorCount += 1;
          skippedStudents.push({ ...student, reason: "Missing Registration Number", status: 'Error' });
          continue;
        }

        if (roll && seenRolls.has(roll)) {
          skippedStudents.push({ ...student, reason: "Duplicate roll number in uploaded file", status: 'Duplicate' });
          continue;
        }
        if (email && seenEmails.has(email)) {
          skippedStudents.push({ ...student, reason: "Duplicate email in uploaded file", status: 'Duplicate' });
          continue;
        }
        if (phone && seenPhones.has(phone)) {
          skippedStudents.push({ ...student, reason: "Duplicate mobile number in uploaded file", status: 'Duplicate' });
          continue;
        }
        if (roll) seenRolls.add(roll);
        if (email) seenEmails.add(email);
        if (phone) seenPhones.add(phone);

        const existingChecks = await Promise.all([
          getDocs(query(usersRef, where("universityRoll", "==", roll), limit(1))),
          email ? getDocs(query(usersRef, where("email", "==", email), limit(1))) : Promise.resolve(null),
          phone ? getDocs(query(usersRef, where("contactNumber", "==", phone), limit(1))) : Promise.resolve(null),
          getDocs(query(importedRef, where("universityRoll", "==", roll), limit(1))),
          email ? getDocs(query(importedRef, where("email", "==", email), limit(1))) : Promise.resolve(null),
          phone ? getDocs(query(importedRef, where("contactNumber", "==", phone), limit(1))) : Promise.resolve(null),
        ]);

        if (!existingChecks[0].empty) {
          skippedStudents.push({ ...student, reason: "Already registered with this roll number", status: 'Duplicate' });
          continue;
        }
        if (existingChecks[1] && !existingChecks[1].empty) {
          skippedStudents.push({ ...student, reason: "Already registered with this email", status: 'Duplicate' });
          continue;
        }
        if (existingChecks[2] && !existingChecks[2].empty) {
          skippedStudents.push({ ...student, reason: "Already registered with this mobile number", status: 'Duplicate' });
          continue;
        }
        if (!existingChecks[3].empty || (existingChecks[4] && !existingChecks[4].empty) || (existingChecks[5] && !existingChecks[5].empty)) {
          skippedStudents.push({ ...student, reason: "Already exists in imported database", status: 'Duplicate' });
          continue;
        }

        const docData = {
          fullName: student.fullName || "",
          parentName: student.parentName || "",
          contactNumber: phone || student.contactNumber || "",
          email: email || "",
          gender: student.gender || "",
          college: student.college || "",
          university: student.university || "",
          course: student.course || "",
          semester: student.semester || "",
          universityRoll: roll,
          universityRollNo: student.universityRollNo || "",
          industrialRegNo: student.industrialRegNo || "",
          importedAt: new Date().toISOString(),
          paymentStatus: "Pending",
          whatsappSent: false,
          status: 'Imported'
        };

        const newRef = doc(collection(db, "importedStudents"));
        batch.set(newRef, docData);
        importedCount += 1;
        importedStudents.push(docData);
      }

      await batch.commit();
    }

    return {
      totalCount: students.length,
      importedCount,
      skippedCount: skippedStudents.length - errorCount,
      errorCount,
      importedStudents,
      skippedStudents,
    };
  };

  const handleImportSubmit = async () => {
    if (parsedData.length === 0 || !user) return;

    setImporting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const summary = await importStudentsClientSide(parsedData);
      setImportSummary(summary);
      setSuccessMsg(`Successfully imported ${summary.importedCount} student records. Skipped ${summary.skippedCount} duplicates.`);
      setFile(null);
      setParsedData([]);
      await fetchImportedStudents();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during import.");
    } finally {
      setImporting(false);
    }
  };

  // Combine database students + transient imported/skipped summary items for display
  const combinedList = React.useMemo(() => {
    const list: any[] = [];

    // Database students
    databaseStudents.forEach(s => {
      list.push({
        id: s.id || s.universityRoll,
        fullName: s.fullName || 'Student',
        parentName: s.parentName || '-',
        contactNumber: s.contactNumber || '-',
        email: s.email || '-',
        college: s.college || '-',
        course: s.course || '-',
        semester: s.semester || '-',
        status: s.status || 'Imported',
        importedAt: s.importedAt || new Date().toISOString()
      });
    });

    // Append skipped/duplicates from latest import summary if not in list
    if (importSummary?.skippedStudents) {
      importSummary.skippedStudents.forEach((sk, idx) => {
        list.push({
          id: `skipped-${idx}-${sk.universityRoll}`,
          fullName: sk.fullName || 'Student',
          parentName: sk.parentName || '-',
          contactNumber: sk.contactNumber || '-',
          email: sk.email || '-',
          college: sk.college || '-',
          course: sk.course || '-',
          semester: sk.semester || '-',
          status: sk.status || 'Duplicate',
          reason: sk.reason,
          importedAt: new Date().toISOString()
        });
      });
    }

    return list;
  }, [databaseStudents, importSummary]);

  // Filtered List based on Search & Status
  const filteredList = combinedList.filter(item => {
    const matchesSearch =
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contactNumber.includes(searchTerm) ||
      item.college.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && item.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Pagination
  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedList = filteredList.slice(startIndex, startIndex + pageSize);

  const formatDate = (iso?: string) => {
    if (!iso) return 'Just now';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  // Calculated Metrics
  const totalRecordsCount = importSummary ? importSummary.totalCount : databaseStudents.length;
  const importedRecordsCount = importSummary ? importSummary.importedCount : databaseStudents.length;
  const skippedRecordsCount = importSummary ? importSummary.skippedCount : 0;
  const errorRecordsCount = importSummary ? importSummary.errorCount : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none animate-fade-in">
      
      {/* 1. TOP TITLE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/admin-dashboard')}
            variant="outline"
            className="rounded-2xl h-11 px-4 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs gap-2 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <Upload size={22} />
              </div>
              <span>Import Students</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Upload an Excel or CSV file to pre-register students and automatically send WhatsApp reminders.
            </p>
          </div>
        </div>

        <Button
          onClick={handleDownloadTemplate}
          className="h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer active:scale-95"
        >
          <Download size={15} />
          <span>Download Template</span>
        </Button>
      </div>

      {/* 2. UPLOAD & SUPPORTED COLUMNS CARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Box (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-inner">
              <FileSpreadsheet size={32} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Choose Excel / CSV File to Upload</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Drag and drop your file here, or click to browse
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <label className="inline-flex h-11 items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 rounded-2xl transition shadow-md shadow-blue-600/20 cursor-pointer active:scale-95">
                <Upload size={16} />
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {file && (
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs px-3.5 py-1.5 rounded-full">
                <FileSpreadsheet size={14} />
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Supported formats: .xlsx, .xls, .csv | Maximum file size: 10MB
            </p>
          </div>
        </div>

        {/* Supported Columns Card (5 Cols) */}
        <div className="lg:col-span-5 bg-blue-50/60 border border-blue-200/60 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-900 font-black text-sm mb-2">
              <Info size={18} className="text-blue-600 shrink-0" />
              <span>Supported Columns</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed mb-4">
              For best results, name columns exactly like this in the sheet:
            </p>

            {/* Column Badges Grid */}
            <div className="flex flex-wrap gap-2">
              {supportedColumns.map((col) => (
                <span
                  key={col}
                  className="bg-white border border-blue-200/80 text-blue-700 font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-2xs"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {parsedData.length > 0 && (
            <div className="pt-4 border-t border-blue-200/60 flex items-center justify-between">
              <span className="text-xs font-black text-blue-900">{parsedData.length} records parsed</span>
              <Button
                onClick={handleImportSubmit}
                disabled={importing}
                className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition active:scale-95"
              >
                {importing ? 'Importing...' : 'Start Import'}
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Warnings / Error Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-3">
          <XCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 3. IMPORT SUMMARY CARDS */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 tracking-tight">Import Summary</h3>
          <button
            onClick={fetchImportedStudents}
            className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition cursor-pointer"
          >
            <RefreshCw size={13} className={loadingTable ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Records */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Records</span>
              <h4 className="text-2xl font-black text-slate-900 mt-0.5">{totalRecordsCount}</h4>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
          </div>

          {/* Card 2: Successfully Imported */}
          <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Successfully Imported</span>
              <h4 className="text-2xl font-black text-emerald-900 mt-0.5">{importedRecordsCount}</h4>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 size={20} />
            </div>
          </div>

          {/* Card 3: Skipped / Duplicates */}
          <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Skipped / Duplicates</span>
              <h4 className="text-2xl font-black text-amber-900 mt-0.5">{skippedRecordsCount}</h4>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle size={20} />
            </div>
          </div>

          {/* Card 4: Errors */}
          <div className="bg-rose-50/50 border border-rose-200/70 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Errors</span>
              <h4 className="text-2xl font-black text-rose-900 mt-0.5">{errorRecordsCount}</h4>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <XCircle size={20} />
            </div>
          </div>

        </div>
      </div>

      {/* 4. IMPORTED STUDENTS LISTING TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Imported Students</h3>
            <p className="text-xs font-semibold text-slate-450 mt-0.5">List of all pre-registered students imported into the system</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search student..."
                className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-2xs transition"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e: any) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="All">All Status</option>
              <option value="Imported">Imported</option>
              <option value="Duplicate">Duplicate</option>
              <option value="Error">Error</option>
            </select>
          </div>
        </div>

        {/* Table Listing */}
        {loadingTable ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm">
            Loading imported students list...
          </div>
        ) : paginatedList.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center">
            <Users size={40} className="mx-auto text-slate-300 mb-2" />
            <h4 className="font-extrabold text-sm text-slate-700">No imported students found</h4>
            <p className="text-xs text-slate-400 font-semibold mt-1">Import an Excel sheet to populate student records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="pb-3 px-4">#</th>
                  <th className="pb-3 px-4">Student Name</th>
                  <th className="pb-3 px-4">Father's Name</th>
                  <th className="pb-3 px-4">Mobile Number</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">College Name</th>
                  <th className="pb-3 px-4">Course</th>
                  <th className="pb-3 px-4">Semester</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Imported On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {paginatedList.map((student, idx) => {
                  const num = startIndex + idx + 1;
                  const isImported = student.status === 'Imported';
                  const isDuplicate = student.status === 'Duplicate';

                  return (
                    <tr key={student.id || idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-400">{num}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">{student.fullName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{student.parentName || '-'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-800">{student.contactNumber || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{student.email || '-'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 max-w-[180px] truncate">{student.college || '-'}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">{student.course || '-'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-600">{student.semester || '-'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isImported
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDuplicate
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {student.status || 'Imported'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {formatDate(student.importedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalEntries > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalEntries)} of {totalEntries} entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
