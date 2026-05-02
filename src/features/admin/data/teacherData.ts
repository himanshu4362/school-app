export interface Teacher {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  joinDate: string | null; // Null if they haven't accepted the invite yet
  status: 'Invited' | 'Active' | 'On Leave' | 'Offboarded'; // Updated statuses
  attendanceRate: number | null; 
  salary: number; 
}

export const fetchTeachers = (): Promise<Teacher[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "TCH-001",
          name: "Dr. Arvind Sharma",
          department: "Physics",
          email: "arvind.s@dpsranchi.edu.in",
          phone: "+91 98765 11111",
          joinDate: "2018-04-12",
          status: "Active",
          attendanceRate: 98.5,
          salary: 65000,
        },
        {
          id: "TCH-005",
          name: "Ravi Verma",
          department: "History",
          email: "ravi.v@dpsranchi.edu.in",
          phone: "+91 98765 55555",
          joinDate: null,
          status: "Invited", // Pending acceptance
          attendanceRate: null,
          salary: 45000,
        },
        {
          id: "TCH-003",
          name: "Sanjay Gupta",
          department: "Computer Science",
          email: "sanjay.g@dpsranchi.edu.in",
          phone: "+91 98765 33333",
          joinDate: "2021-01-15",
          status: "On Leave",
          attendanceRate: 82.0,
          salary: 58000,
        },
        {
          id: "TCH-002",
          name: "Meera Reddy",
          department: "Mathematics",
          email: "meera.r@dpsranchi.edu.in",
          phone: "+91 98765 22222",
          joinDate: "2020-07-01",
          status: "Offboarded", // Former employee
          attendanceRate: 95.0,
          salary: 55000,
        }
      ]);
    }, 800);
  });
};