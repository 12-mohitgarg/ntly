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
  district: string;
  college: string;
  university: string;
  degree: string;
  department: string;
  subject: string;
  session: string;
  course: string;
  semester: string;
  universityRoll: string;
  universityRollNo: string;
  industrialRegNo: string;
  internshipDomain: string;
  internshipMode: string;
  password?: string;
  motherName?: string;
  dateOfBirth?: string;
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

        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (json.length < 2) {
          throw new Error("Excel sheet must contain a header row and at least one data row.");
        }

        const rawHeaders = json[0].map((h: any) => String(h || '').replace(/\u00a0/g, ' ').trim());
        setHeaders(rawHeaders);

        const mappedStudents: ParsedStudent[] = [];
        const fileWarnings: string[] = [];

        // Helper to find column index by multiple potential names
        const normalizeHeader = (value: string) =>
          value
            .replace(/\u00a0/g, ' ')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '');

        const normalizeDepartment = (value: string) => {
          const cleaned = value.replace(/\u00a0/g, ' ').trim();
          const match = cleaned.match(/^(B\.A\.|B\.Sc\.|B\.Com\.|M\.A\.|M\.Sc\.|M\.Com\.)/i);
          return match ? match[1].replace(/(^|\.)([a-z])/g, s => s.toUpperCase()) : cleaned;
        };

        const normalizeSubjectValue = (value: string) => {
          const cleaned = value
            .replace(/\u00a0/g, ' ')
            .replace(/^Major\s*:\s*/i, '')
            .trim();
          const bracketMatch = cleaned.match(/^[A-Z]\.[A-Z][A-Za-z.]*\s*\((.+)\)$/i);
          return bracketMatch ? bracketMatch[1].trim() : cleaned;
        };

        const normalizeSemesterValue = (value: string) => {
          const cleaned = value.replace(/\u00a0/g, ' ').trim();
          const romanMap: Record<string, string> = {
            I: 'Semester 1',
            II: 'Semester 2',
            III: 'Semester 3',
            IV: 'Semester 4',
            V: 'Semester 5',
            VI: 'Semester 6',
            VII: 'Semester 7',
            VIII: 'Semester 8',
          };
          const upper = cleaned.toUpperCase();
          if (romanMap[upper]) return romanMap[upper];
          if (/^\d+$/.test(cleaned)) return `Semester ${cleaned}`;
          return cleaned;
        };

        const normalizeCollegeValue = (value: string) => {
          const cleaned = value.replace(/\u00a0/g, ' ').trim();
          const comparable = cleaned.toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ');
          if (comparable === 'mahila college tekari' || comparable === 'mahila college tekari gaya') return 'Mahila College Tekari, Gaya';
          return cleaned;
        };

        const findColIndex = (names: string[]) => {
          const normalizedNames = names.map(normalizeHeader);
          return rawHeaders.findIndex((h) => normalizedNames.includes(normalizeHeader(h)));
        };

        const nameIdx = findColIndex(['Student Name', "Student's Name", 'Name', 'Full Name', 'fullName', 'StudentName']);
        const parentIdx = findColIndex(["Father's Name", 'Father Name', 'Parent Name', 'parentName', 'FatherName']);
        const motherIdx = findColIndex(["Mother's Name", 'Mother Name', 'MotherName']);
        const dobIdx = findColIndex(['Date of Birth', 'DOB', 'Birth Date']);
        const phoneIdx = findColIndex(['Mobile Number', 'Mobile', 'Phone', 'contactNumber', 'Phone Number', 'MobileNo', 'Mobile No']);
        const emailIdx = findColIndex(['Email', 'email', 'Email Address', 'EmailId', 'E-mail']);
        const genderIdx = findColIndex(['Gender', 'gender', 'Sex']);
        const collegeIdx = findColIndex(['College Name', 'College', 'college']);
        const uniIdx = findColIndex(['University', 'university', 'University Name']);
        const degreeIdx = findColIndex(['Degree', 'Degree (UG/PG)']);
        const departmentIdx = findColIndex(['Department', 'Department Name']);
        const subjectIdx = findColIndex(['Subject', 'Subjects', 'Major Subject']);
        const sessionIdx = findColIndex(['Session', 'Academic Session']);
        const courseIdx = findColIndex(['Course', 'course']);
        const domainIdx = findColIndex(['Internship Domain', 'Domain', 'domain']);
        const modeIdx = findColIndex(['Mode', 'Mode (Online/Offline)', 'Internship Mode']);
        const passwordIdx = findColIndex(['Password', 'Default Password']);
        const semIdx = findColIndex(['Semester', 'semester', 'Year/Semester']);
        const rollIdx = findColIndex(['University Registration Number', 'Registration Number', 'Reg No', 'Reg. No.', 'universityRoll', 'RegNo']);
        const rollNoIdx = findColIndex(['University Roll No', 'University Roll Number', 'Roll Number', 'Roll No', 'universityRollNo', 'RollNo']);
        const indIdx = findColIndex(['Industrial Registration Number', 'Industrial Reg No', 'industrialRegNo', 'IndustrialRegNo']);

        // Check required fields
        if (rollIdx === -1) fileWarnings.push("Missing University Registration Number column. Students won't be able to verify.");
        if (nameIdx === -1) fileWarnings.push("Missing Student Name column.");
        if (phoneIdx === -1) fileWarnings.push("Missing Mobile Number column.");
        if (emailIdx === -1) fileWarnings.push("Missing Email column.");
        if (domainIdx === -1) fileWarnings.push("Missing Internship Domain column. Students can still import, but the domain will need to be selected during registration.");
        if (sessionIdx === -1) fileWarnings.push("Missing Session column. Students can still import, but session may need manual confirmation.");
        if (semIdx === -1) fileWarnings.push("Missing Semester column. Students can still import, but semester may need manual confirmation.");

        for (let r = 1; r < json.length; r++) {
          const row = json[r];
          if (!row || row.length === 0) continue;
          const hasData = row.some((val: any) => val !== null && val !== undefined && String(val).trim() !== '');
          if (!hasData) continue;

          const getVal = (idx: number) => {
            if (idx === -1 || idx >= row.length) return '';
            const value = row[idx];
            if (value instanceof Date) {
              return value.toLocaleDateString('en-IN');
            }
            return String(value || '').replace(/\u00a0/g, ' ').trim();
          };

          const fileName = selectedFile.name.toLowerCase();
          const isMahilaTekariSheet = fileName.includes('mahila') && fileName.includes('tekari');
          const isExStudentSheet = fileName.includes('ex-student');
          const sessionFromFile = fileName.includes('2024-28') ? '2024-28' : fileName.includes('2023-27') ? '2023-27' : '';
          const rawDegree = getVal(degreeIdx);
          const department = getVal(departmentIdx) || normalizeDepartment(rawDegree);
          const subject = normalizeSubjectValue(getVal(subjectIdx));
          const internshipDomain = getVal(domainIdx) || getVal(courseIdx);

          mappedStudents.push({
            fullName: getVal(nameIdx),
            parentName: getVal(parentIdx),
            contactNumber: getVal(phoneIdx),
            email: getVal(emailIdx),
            gender: getVal(genderIdx) || (isMahilaTekariSheet ? 'Female' : ''),
            district: isMahilaTekariSheet ? 'Gaya' : '',
            college: normalizeCollegeValue(getVal(collegeIdx)) || (isMahilaTekariSheet ? 'Mahila College Tekari, Gaya' : ''),
            university: getVal(uniIdx) || (isMahilaTekariSheet ? 'Magadh University (MU), Bodh Gaya' : ''),
            degree: rawDegree === 'UG' || rawDegree === 'PG' ? rawDegree : (rawDegree.includes('B.') ? 'UG' : ''),
            department,
            subject,
            session: getVal(sessionIdx) || sessionFromFile,
            course: internshipDomain,
            semester: normalizeSemesterValue(getVal(semIdx)) || (isExStudentSheet ? '' : 'Semester 5'),
            universityRoll: getVal(rollIdx),
            universityRollNo: getVal(rollNoIdx),
            industrialRegNo: getVal(indIdx),
            internshipDomain,
            internshipMode: getVal(modeIdx) || 'Online',
            password: getVal(passwordIdx),
            motherName: getVal(motherIdx),
            dateOfBirth: getVal(dobIdx),
            academicDetails: getVal(acadIdx) || [rawDegree, subject].filter(Boolean).join(' | '),
          });
        }

        if (mappedStudents.length === 0) {
          throw new Error("No valid student rows found in the uploaded sheet.");
        }

        const countDuplicates = (values: string[]) =>
          values.reduce((count, value, _index, list) => count + (value && list.indexOf(value) !== list.lastIndexOf(value) ? 1 : 0), 0);
        const duplicatePhoneRows = countDuplicates(mappedStudents.map(student => student.contactNumber.replace(/\D/g, '').slice(-10)));
        const duplicateEmailRows = countDuplicates(mappedStudents.map(student => student.email.trim().toLowerCase()));
        if (duplicatePhoneRows > 0) {
          fileWarnings.push(`${duplicatePhoneRows} rows share a mobile number. They will still import because registration number is used as the unique student ID.`);
        }
        if (duplicateEmailRows > 0) {
          fileWarnings.push(`${duplicateEmailRows} rows share an email address. They will still import because registration number is used as the unique student ID.`);
        }

        setWarnings(fileWarnings);
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
        if (roll) seenRolls.add(roll);

        const existingChecks = await Promise.all([
          getDocs(query(usersRef, where("universityRoll", "==", roll), limit(1))),
          getDocs(query(importedRef, where("universityRoll", "==", roll), limit(1))),
        ]);

        if (!existingChecks[0].empty) {
          skippedStudents.push({ ...student, reason: "Already registered with this roll number", status: 'Duplicate' });
          continue;
        }
        if (!existingChecks[1].empty) {
          skippedStudents.push({ ...student, reason: "Student already exists in imported list" });
          continue;
        }

        const docData = {
          fullName: student.fullName || "",
          parentName: student.parentName || "",
          contactNumber: phone || student.contactNumber || "",
          email: email || "",
          gender: student.gender || "",
          district: student.district || "",
          college: student.college || "",
          university: student.university || "",
          degree: student.degree || "",
          department: student.department || "",
          subject: student.subject || "",
          session: student.session || "",
          course: student.course || "",
          semester: student.semester || "",
          universityRoll: roll,
          universityRollNo: student.universityRollNo || "",
          industrialRegNo: student.industrialRegNo || "",
          internshipDomain: student.internshipDomain || student.course || "",
          internshipMode: student.internshipMode || "Online",
          motherName: student.motherName || "",
          dateOfBirth: student.dateOfBirth || "",
          academicDetails: student.academicDetails || "",
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

    // Additional check
    const hasUnverifiable = parsedData.some(s => !s.universityRoll);
    if (hasUnverifiable) {
      if (!confirm("Some rows are missing University Registration Number. These students will not be able to complete their registration. Do you want to proceed?")) {
        return;
      }
    }

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

      {/* Main card */}
      <div className="student-card p-6 bg-white/80 border border-slate-100/50 shadow-xl rounded-3xl space-y-6">
        {/* Help Tip */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700 flex gap-3">
          <HelpCircle className="size-5 shrink-0 mt-0.5 text-blue-600" />
          <div className="space-y-1">
            <span className="font-black">Supported Columns:</span>
            <p className="text-xs font-semibold leading-relaxed">
              For best results, name columns exactly like this in the sheet:
              <br />
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">Student Name</code>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">Father's Name</code>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">Mobile Number</code>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">Email</code>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">Gender</code>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">College Name</code>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">University</code>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">Course</code>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">Semester</code>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">University Registration Number</code>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-black text-indigo-600 mx-1">University Roll No</code>
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

            {importSummary.importedStudents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-700">Imported Students</h4>
                <div className="overflow-x-auto border border-emerald-100 rounded-2xl">
                  <table className="w-full text-left border-collapse table-auto text-xs min-w-[900px]">
                    <thead className="bg-emerald-50">
                      <tr className="border-b border-emerald-100">
                        <th className="p-3 font-black text-emerald-800 uppercase tracking-wider">Student</th>
                        <th className="p-3 font-black text-emerald-800 uppercase tracking-wider">Contact</th>
                        <th className="p-3 font-black text-emerald-800 uppercase tracking-wider">College</th>
                        <th className="p-3 font-black text-emerald-800 uppercase tracking-wider">Course</th>
                        <th className="p-3 font-black text-emerald-800 uppercase tracking-wider">Registration / Roll</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50 bg-white">
                      {importSummary.importedStudents.map((student, idx) => (
                        <tr key={`${student.universityRoll}-${idx}`} className="hover:bg-emerald-50/40">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{student.fullName || '-'}</div>
                            <div className="text-[10px] font-semibold text-slate-400">S/o: {student.parentName || '-'}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-700">{student.email || '-'}</div>
                            <div className="text-[10px] font-semibold text-slate-400">{student.contactNumber || '-'}</div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{student.college || '-'}</td>
                          <td className="p-3">
                            <div className="font-bold text-indigo-600">{student.course || '-'}</div>
                            <div className="text-[10px] font-semibold text-slate-400">{student.semester || '-'}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">Reg: {student.universityRoll || '-'}</div>
                            <div className="text-[10px] font-bold text-slate-500">Roll: {student.universityRollNo || '-'}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importSummary.skippedStudents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-700">Skipped Rows</h4>
                <div className="overflow-x-auto border border-amber-100 rounded-2xl">
                  <table className="w-full text-left border-collapse table-auto text-xs min-w-[900px]">
                    <thead className="bg-amber-50">
                      <tr className="border-b border-amber-100">
                        <th className="p-3 font-black text-amber-800 uppercase tracking-wider">Student</th>
                        <th className="p-3 font-black text-amber-800 uppercase tracking-wider">Contact</th>
                        <th className="p-3 font-black text-amber-800 uppercase tracking-wider">Registration / Roll</th>
                        <th className="p-3 font-black text-amber-800 uppercase tracking-wider">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-50 bg-white">
                      {importSummary.skippedStudents.map((student, idx) => (
                        <tr key={`${student.universityRoll}-${idx}`} className="hover:bg-amber-50/40">
                          <td className="p-3 font-bold text-slate-900">{student.fullName || '-'}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-700">{student.email || '-'}</div>
                            <div className="text-[10px] font-semibold text-slate-400">{student.contactNumber || '-'}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">Reg: {student.universityRoll || '-'}</div>
                            <div className="text-[10px] font-bold text-slate-500">Roll: {student.universityRollNo || '-'}</div>
                          </td>
                          <td className="p-3 font-bold text-amber-700">{student.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

          {warnings.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold space-y-1">
              <div className="flex items-center gap-2 text-sm text-amber-900 mb-1">
                <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                <span>Import Column Mapping Warnings:</span>
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
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${isImported
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isDuplicate
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                          {student.status || 'Imported'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-700">{student.email}</div>
                        <div className="text-[10px] font-semibold text-slate-400">{student.contactNumber}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-600">{student.gender || '-'}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800 truncate max-w-[200px]">{student.college}</div>
                        <div className="text-[10px] font-semibold text-slate-400 truncate max-w-[200px]">{student.university}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-indigo-600">{student.course}</div>
                        <div className="text-[10px] font-semibold text-slate-400">{student.semester}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">Reg: {student.universityRoll || <span className="text-rose-500">Missing</span>}</div>
                        <div className="text-[10px] font-bold text-slate-500">Roll: {student.universityRollNo || '-'}</div>
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
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition cursor-pointer ${currentPage === pageNum
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
