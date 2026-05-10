import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ScanLine, UserCheck, BookOpen, ShieldAlert, X, AlertCircle, CheckCircle2, RotateCcw, ShieldX } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { issueCopy, returnCopy, declareLost, clearLibraryErrors, registerBorrower } from '../../../../store/slices/librarySlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { PhysicalCopy, MasterTitle } from '../../../../types/library/library.schema';

const CirculationDeskHub: React.FC = () => {
    const dispatch = useDispatch();
    const { copies, titles, borrowers, transactions, validationErrors } = useSelector((state: RootState) => state.library);

    // Scanner States
    const [borrowerScan, setBorrowerScan] = useState('');
    const [activeBorrowerId, setActiveBorrowerId] = useState<string | null>(null);

    // Product Verification States
    const [accessionScan, setAccessionScan] = useState('');
    const [scannedCopy, setScannedCopy] = useState<PhysicalCopy | null>(null);
    const [scannedTitle, setScannedTitle] = useState<MasterTitle | null>(null);

    // 🧪 Auto-Seed a dummy borrower for testing
    useEffect(() => {
        if (!borrowers['STU-001']) {
            dispatch(registerBorrower({
                id: 'STU-001', borrowerType: 'STUDENT', linkedEntityId: 'Rahul Sharma',
                status: 'ACTIVE', maxBooksAllowed: 3, maxDaysAllowed: 14, finePerDay: 5, totalPendingFines: 0
            }));
        }
    }, [dispatch, borrowers]);

    const activeBorrower = activeBorrowerId ? borrowers[activeBorrowerId] : null;

    // Derived State: Find all active issues for the current borrower
    const activeIssues = transactions
        .filter(t => t.borrowerId === activeBorrowerId && t.type === 'ISSUE')
        .filter(t => {
            const isReturned = transactions.some(ret =>
                (ret.type === 'RETURN' || ret.type === 'LOST_DECLARED') &&
                ret.copyId === t.copyId &&
                new Date(ret.timestamp) > new Date(t.timestamp)
            );
            return !isReturned;
        });

    // ==========================================
    // HANDLERS
    // ==========================================
    const handleBorrowerScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (borrowers[borrowerScan]) {
                setActiveBorrowerId(borrowerScan);
                // Clear any leftover scanned book when switching borrowers
                setScannedCopy(null); setScannedTitle(null); setAccessionScan('');
            } else {
                alert("Borrower ID not found! Try 'STU-001'");
            }
        }
    };

    // Step 1 of Issuing: Fetch the book details to verify
    const handleAccessionScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const copy = Object.values(copies).find(c => c.accessionNumber === accessionScan);
            if (copy) {
                setScannedCopy(copy);
                setScannedTitle(titles[copy.titleId]);
            } else {
                alert("Invalid Book Number! Ensure the school stamp/barcode is correct.");
                setScannedCopy(null);
                setScannedTitle(null);
            }
        }
    };

    // Step 2 of Issuing: Commit the transaction
    const handleFinalIssue = () => {
        if (!scannedCopy || !activeBorrowerId) return;
        dispatch(issueCopy({
            copyId: scannedCopy.id,
            borrowerId: activeBorrowerId,
            operatorId: 'ADMIN-LIB-01'
        }));
        // Reset scanner after successful issue
        setScannedCopy(null);
        setScannedTitle(null);
        setAccessionScan('');
    };

    const handleReturn = (copyId: string, condition: 'GOOD' | 'DAMAGED') => {
        if (!activeBorrowerId) return;
        dispatch(returnCopy({ copyId, borrowerId: activeBorrowerId, operatorId: 'ADMIN-LIB-01', condition }));
    };

    const handleLost = (copyId: string) => {
        if (!activeBorrowerId) return;
        if (window.confirm("Declare this copy LOST? This will apply a penalty to the student's ledger.")) {
            dispatch(declareLost({ copyId, borrowerId: activeBorrowerId, operatorId: 'ADMIN-LIB-01' }));
        }
    };

    return (
        <AdminLayout pageTitle="Circulation Desk" pageDescription="High-speed barcode scanning for Issue, Return, and Fine processing." breadcrumbs={[{ label: 'Library Hub' }, { label: 'Circulation' }]}>

            {/* ERROR BANNER */}
            {validationErrors.length > 0 && (
                <div className="mb-6 bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl flex items-start justify-between shadow-sm animate-in slide-in-from-top-2">
                    <div className="flex gap-3">
                        <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Transaction Blocked</h4>
                            <ul className="mt-1 space-y-1">{validationErrors.map((err, idx) => <li key={idx} className="text-xs font-bold text-rose-700">{err.message}</li>)}</ul>
                        </div>
                    </div>
                    <button onClick={() => dispatch(clearLibraryErrors())} className="text-rose-400 hover:text-rose-700"><X size={20} /></button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)]">

                {/* ========================================== */}
                {/* LEFT COLUMN: THE SCANNER CONSOLE */}
                {/* ========================================== */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">

                    {/* 1. IDENTITY SCANNER */}
                    <div className={`p-6 rounded-3xl border-2 transition-all shadow-sm shrink-0 ${activeBorrower ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <UserCheck size={16} className={activeBorrower ? 'text-indigo-600' : 'text-slate-400'} />
                            1. Scan Identity Card
                        </h3>
                        <div className="relative">
                            <ScanLine className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="text" autoFocus
                                placeholder="Type STU-001 + Enter"
                                value={borrowerScan} onChange={e => setBorrowerScan(e.target.value)} onKeyDown={handleBorrowerScan}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                        </div>

                        {activeBorrower && (
                            <div className="mt-6 pt-6 border-t border-indigo-200/50 animate-in fade-in">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-lg font-black text-indigo-900">{activeBorrower.linkedEntityId}</h4>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-200 text-indigo-800 text-[10px] font-black uppercase tracking-widest rounded">
                                            {activeBorrower.borrowerType}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${activeBorrower.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {activeBorrower.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="bg-white p-3 rounded-xl border border-indigo-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Limit</p>
                                        <p className="text-sm font-black text-slate-800"><span className={activeIssues.length >= activeBorrower.maxBooksAllowed ? 'text-rose-600' : 'text-emerald-600'}>{activeIssues.length}</span> / {activeBorrower.maxBooksAllowed}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-rose-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Fines</p>
                                        <p className="text-sm font-black text-rose-600">₹{activeBorrower.totalPendingFines}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. PRODUCT VERIFICATION SCANNER */}
                    <div className={`p-6 rounded-3xl border-2 transition-all shadow-sm flex flex-col ${!activeBorrower ? 'bg-slate-50 border-slate-200 opacity-50 pointer-events-none' : 'bg-emerald-50 border-emerald-200'}`}>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <BookOpen size={16} className="text-emerald-600" />
                            2. Scan Book Barcode
                        </h3>
                        <div className="relative mb-4">
                            <ScanLine className="absolute left-3 top-3.5 text-emerald-600" size={18} />
                            <input
                                type="text"
                                placeholder="Type Accession Number + Enter"
                                value={accessionScan} onChange={e => setAccessionScan(e.target.value)} onKeyDown={handleAccessionScan}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-emerald-300 rounded-xl text-sm font-bold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                            />
                        </div>

                        {/* PRODUCT CARD OR PLACEHOLDER */}
                        {scannedTitle && scannedCopy ? (
                            <div className="flex-1 flex flex-col animate-in zoom-in-95 duration-200 mt-2">
                                <div className="bg-white rounded-2xl p-4 border border-emerald-100 flex gap-4 shadow-sm">
                                    <img
                                        src={scannedTitle.thumbnailUrl || 'https://images.unsplash.com/photo-1543005128-d1b1502c6fd7?q=80&w=200&auto=format&fit=crop'}
                                        alt="cover"
                                        className="w-20 h-28 object-cover rounded-lg shadow-md border border-slate-100"
                                    />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-slate-900 leading-tight">{scannedTitle.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">By {scannedTitle.author}</p>
                                        <div className="mt-3 space-y-1">
                                            <p className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                                                STAMP: {scannedCopy.accessionNumber}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 block uppercase mt-1">
                                                Condition: {scannedCopy.condition}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleFinalIssue}
                                    className="mt-4 w-full bg-emerald-600 text-white p-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-md flex justify-center items-center gap-2 transition-colors"
                                >
                                    <CheckCircle2 size={16} /> Process Physical Issue
                                </button>

                                <button
                                    onClick={() => { setScannedCopy(null); setScannedTitle(null); setAccessionScan(''); }}
                                    className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                                >
                                    Cancel / Wrong Book
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 border-2 border-dashed border-emerald-200/50 bg-emerald-50/50 rounded-2xl flex flex-col items-center justify-center text-emerald-600/40 p-6">
                                <BookOpen size={32} className="mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Barcode Scan...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* RIGHT COLUMN: ACTIVE ISSUES & LEDGER */}
                {/* ========================================== */}
                <div className="lg:col-span-8 h-full flex flex-col">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                        {!activeBorrower ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <ScanLine size={48} className="text-slate-200 mb-4" />
                                <h2 className="text-xl font-black text-slate-900">Waiting for Scan</h2>
                                <p className="text-sm font-bold text-slate-500 mt-2">Scan a student or faculty ID card to open their circulation ledger.</p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 shrink-0">
                                    <h3 className="text-lg font-black text-slate-900">Currently Issued Holdings</h3>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        {activeIssues.length} Items Active
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                    {activeIssues.length === 0 ? (
                                        <div className="text-center py-12">
                                            <BookOpen size={32} className="mx-auto text-slate-200 mb-3" />
                                            <p className="text-sm font-bold text-slate-400">No active books issued to this borrower.</p>
                                        </div>
                                    ) : (
                                        activeIssues.map(issue => {
                                            const copy = copies[issue.copyId!];
                                            const title = titles[copy?.titleId];
                                            const isOverdue = new Date(issue.dueDateSnapshot!) < new Date();

                                            return (
                                                <div key={issue.id} className={`p-4 rounded-2xl border-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200 hover:border-indigo-200 transition-colors'}`}>
                                                    <div className="flex gap-4 items-center">
                                                        <img src={title?.thumbnailUrl || 'https://images.unsplash.com/photo-1543005128-d1b1502c6fd7?q=80&w=200&auto=format&fit=crop'} className="w-12 h-16 object-cover rounded shadow-sm border border-slate-100 hidden md:block" alt="cover" />
                                                        <div>
                                                            <h4 className="text-sm font-black text-slate-900">{title?.title || 'Unknown Title'}</h4>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">
                                                                Barcode: {copy?.accessionNumber}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                                    Due: {new Date(issue.dueDateSnapshot!).toLocaleDateString()}
                                                                </span>
                                                                {isOverdue && <span className="flex items-center gap-1 text-[9px] font-black text-rose-600 uppercase tracking-widest"><AlertCircle size={10} /> Overdue</span>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 w-full md:w-auto">
                                                        <button onClick={() => handleReturn(copy.id, 'GOOD')} className="flex-1 md:flex-none px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex justify-center items-center gap-2 shadow-sm">
                                                            <RotateCcw size={14} /> Return
                                                        </button>
                                                        <button onClick={() => handleLost(copy.id)} className="flex-1 md:flex-none px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2">
                                                            <ShieldX size={14} /> Lost
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout >
    );
};

export default CirculationDeskHub;