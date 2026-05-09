import React from 'react';
import { useSelector } from 'react-redux';
import { selectFilteredStaff } from '../../../../store/selectors/facultySelectors';
import { RootState } from '../../../../store/store';
import AdminLayout from '../../components/layout/AdminLayout';
import DirectoryToolbar from '../../components/faculty/directory/DirectoryToolbar';
import FacultyCard from '../../components/faculty/directory/FacultyCard';
import StaffProfileDrawer from '../../components/faculty/directory/StaffProfileDrawer';
import { FacultyEmployee } from '../../../../types/faculty/directory.schema';
import { Search } from 'lucide-react';

const StaffDirectory: React.FC = () => {
    const filteredStaff = useSelector(selectFilteredStaff);
    const viewMode = useSelector((state: RootState) => state.facultyDirectory.viewMode);

    return (
        <AdminLayout
            pageTitle="Workforce Console"
            pageDescription="Operational registry for all academic and administrative staff."
            breadcrumbs={[{ label: 'Workforce' }, { label: 'Directory' }]}
        >
            <DirectoryToolbar />

            {filteredStaff.length > 0 ? (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {filteredStaff.map((emp: FacultyEmployee) => (
                                <FacultyCard key={emp.id} employee={emp} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                            {/* List View Table Implementation will go here */}
                            <div className="p-10 text-center font-bold text-slate-400 italic">List View Table Rendering...</div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto"><Search size={40} /></div>
                    <h3 className="text-xl font-black text-slate-900">No Workforce Records Found</h3>
                    <p className="text-sm font-medium text-slate-400">Try adjusting your filters or search terms.</p>
                </div>
            )}

            {/* The Master Operational Drawer */}
            <StaffProfileDrawer />
        </AdminLayout>
    );
};

export default StaffDirectory;