import { db } from '../src/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { INTERNSHIP_DOMAINS } from '../src/lib/constants';

async function reopenAllCourses() {
  try {
    console.log('Reopening all courses/domains in Firestore...');
    
    // 1. Fetch existing courseCompletion docs
    const completionSnap = await getDocs(collection(db, 'courseCompletion'));
    console.log(`Found ${completionSnap.docs.length} existing courseCompletion documents.`);

    for (const docSnap of completionSnap.docs) {
      await setDoc(
        doc(db, 'courseCompletion', docSnap.id),
        {
          course: docSnap.id,
          completed: false,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      console.log(`Updated courseCompletion document: ${docSnap.id} -> completed: false`);
    }

    // 2. Ensure all INTERNSHIP_DOMAINS are marked completed: false
    for (const domain of INTERNSHIP_DOMAINS) {
      await setDoc(
        doc(db, 'courseCompletion', domain),
        {
          course: domain,
          completed: false,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      console.log(`Reopened domain: ${domain}`);
    }

    console.log('✅ All domains have been successfully reopened!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error reopening courses:', error);
    process.exit(1);
  }
}

reopenAllCourses();
