import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Mail, Phone, Calendar, MapPin, CreditCard as Edit, Trash2, Eye, UserPlus, Briefcase, Award, Clock } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  hire_date: string;
  salary?: number;
  status: 'active' | 'inactive' | 'on_leave';
  manager_id?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

const HRManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showMemberDetails, setShowMemberDetails] = useState(false);

  // Mock data for team members (in a real app, this would come from Supabase)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      position: 'Senior Developer',
      department: 'Engineering',
      hire_date: '2023-01-15',
      salary: 95000,
      status: 'active',
      created_at: '2023-01-15T00:00:00Z',
      updated_at: '2023-01-15T00:00:00Z'
    },
    {
      id: '2',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 234-5678',
      position: 'Product Manager',
      department: 'Product',
      hire_date: '2022-08-20',
      salary: 110000,
      status: 'active',
      created_at: '2022-08-20T00:00:00Z',
      updated_at: '2022-08-20T00:00:00Z'
    },
    {
      id: '3',
      first_name: 'Mike',
      last_name: 'Davis',
      email: 'mike.davis@company.com',
      phone: '+1 (555) 345-6789',
      position: 'Marketing Specialist',
      department: 'Marketing',
      hire_date: '2023-03-10',
      salary: 65000,
      status: 'active',
      created_at: '2023-03-10T00:00:00Z',
      updated_at: '2023-03-10T00:00:00Z'
    }
  ]);

  const departments = ['Engineering', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleAddMember = async (formData: FormData) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      position: formData.get('position') as string,
      department: formData.get('department') as string,
      hire_date: formData.get('hireDate') as string,
      salary: formData.get('salary') ? parseInt(formData.get('salary') as string) : undefined,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTeamMembers([...teamMembers, newMember]);
    setShowAddForm(false);
  };

  const handleDeleteMember = (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Calculate HR metrics
  const totalEmployees = teamMembers.length;
  const activeEmployees = teamMembers.filter(m => m.status === 'active').length;
  const newHiresThisMonth = teamMembers.filter(m => {
    const hireDate = new Date(m.hire_date);
    const now = new Date();
    return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear();
  }).length;
  const departmentCount = new Set(teamMembers.map(m => m.department)).size;

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">HR Management</h1>
          <p className="text-gray-400 mt-2">Manage team members, departments, and employee information</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="mt-4 lg:mt-0 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* HR Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Employees</p>
              <p className="text-3xl font-bold text-white mt-2">{totalEmployees}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <UserPlus className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">All team members</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Employees</p>
              <p className="text-3xl font-bold text-white mt-2">{activeEmployees}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Clock className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-sm font-medium text-emerald-400">Currently working</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">New Hires</p>
              <p className="text-3xl font-bold text-white mt-2">+{newHiresThisMonth}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Calendar className="w-4 h-4 text-amber-500 mr-1" />
            <span className="text-sm font-medium text-amber-400">This month</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Departments</p>
              <p className="text-3xl font-bold text-white mt-2">{departmentCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Briefcase className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm font-medium text-purple-400">Active departments</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search team members by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 flex items-center text-gray-300">
            <Filter className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/30 border-b border-gray-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hire Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitials(member.first_name, member.last_name)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-sm text-gray-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{member.position}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{member.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{member.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {new Date(member.hire_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                      {member.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedMember(member);
                          setShowMemberDetails(true);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors duration-150"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors duration-150">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-150"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Team Member</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleAddMember(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                    placeholder="Smith"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="john.smith@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                  <input
                    name="position"
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                    placeholder="Senior Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                  <select 
                    name="department" 
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hire Date</label>
                  <input
                    name="hireDate"
                    type="date"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Salary (Optional)</label>
                  <input
                    name="salary"
                    type="number"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                    placeholder="75000"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Add Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {showMemberDetails && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Employee Details</h3>
              <button
                onClick={() => setShowMemberDetails(false)}
                className="text-gray-400 hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  {getInitials(selectedMember.first_name, selectedMember.last_name)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {selectedMember.first_name} {selectedMember.last_name}
                  </h4>
                  <p className="text-gray-400">{selectedMember.position}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-white">{selectedMember.email}</span>
                </div>
                {selectedMember.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-white">{selectedMember.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-white">{selectedMember.department}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-white">
                    Hired {new Date(selectedMember.hire_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-gray-400 mr-3" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMember.status)}`}>
                    {selectedMember.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-700">
              <button
                onClick={() => setShowMemberDetails(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                Edit Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRManagement;