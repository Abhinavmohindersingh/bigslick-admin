import React, { useState, useRef } from 'react';
import { Plus, Search, Filter, Calendar, Users, Clock, Flag, MoreHorizontal, CreditCard as Edit, Trash2, Eye, CheckCircle, Circle, ArrowRight, Target, TrendingUp, AlertCircle, Star, MessageSquare, Paperclip, User, ChevronDown, ChevronRight, Kanban, BarChart3, List, Grid2x2 as Grid, Timer, Zap, Award } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: string;
  dueDate: string;
  assignedTo: string[];
  tags: string[];
  budget?: number;
  spent?: number;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  comments: number;
  attachments: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

const ProjectManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'kanban' | 'list' | 'calendar' | 'gantt' | 'reports'>('dashboard');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Mock data - in real app, this would come from Supabase
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Gaming Platform Redesign',
      description: 'Complete UI/UX overhaul of the gaming platform',
      status: 'in-progress',
      priority: 'high',
      progress: 65,
      startDate: '2024-01-15',
      dueDate: '2024-03-15',
      assignedTo: ['john', 'sarah', 'mike'],
      tags: ['design', 'frontend', 'ui/ux'],
      budget: 50000,
      spent: 32500,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native mobile app for iOS and Android',
      status: 'planning',
      priority: 'medium',
      progress: 15,
      startDate: '2024-02-01',
      dueDate: '2024-06-01',
      assignedTo: ['alex', 'emma'],
      tags: ['mobile', 'react-native', 'ios', 'android'],
      budget: 75000,
      spent: 5000,
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-22T00:00:00Z'
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      projectId: '1',
      title: 'Design new homepage layout',
      description: 'Create wireframes and mockups for the new homepage',
      status: 'done',
      priority: 'high',
      assignedTo: 'sarah',
      dueDate: '2024-01-25',
      estimatedHours: 16,
      actualHours: 18,
      tags: ['design', 'homepage'],
      comments: 3,
      attachments: 2,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-25T00:00:00Z'
    },
    {
      id: '2',
      projectId: '1',
      title: 'Implement responsive navigation',
      description: 'Code the new navigation component with mobile responsiveness',
      status: 'in-progress',
      priority: 'medium',
      assignedTo: 'john',
      dueDate: '2024-02-05',
      estimatedHours: 12,
      actualHours: 8,
      tags: ['frontend', 'navigation'],
      comments: 1,
      attachments: 0,
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-28T00:00:00Z'
    },
    {
      id: '3',
      projectId: '1',
      title: 'User testing sessions',
      description: 'Conduct user testing with 10 participants',
      status: 'todo',
      priority: 'medium',
      assignedTo: 'mike',
      dueDate: '2024-02-15',
      estimatedHours: 20,
      tags: ['testing', 'ux'],
      comments: 0,
      attachments: 1,
      createdAt: '2024-01-22T00:00:00Z',
      updatedAt: '2024-01-22T00:00:00Z'
    },
    {
      id: '4',
      projectId: '1',
      title: 'Performance optimization',
      description: 'Optimize loading times and improve Core Web Vitals',
      status: 'review',
      priority: 'high',
      assignedTo: 'john',
      dueDate: '2024-02-10',
      estimatedHours: 24,
      actualHours: 20,
      tags: ['performance', 'optimization'],
      comments: 5,
      attachments: 3,
      createdAt: '2024-01-18T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z'
    }
  ]);

  const teamMembers: TeamMember[] = [
    { id: 'john', name: 'John Smith', email: 'john@company.com', role: 'Frontend Developer' },
    { id: 'sarah', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'UI/UX Designer' },
    { id: 'mike', name: 'Mike Davis', email: 'mike@company.com', role: 'Product Manager' },
    { id: 'alex', name: 'Alex Wilson', email: 'alex@company.com', role: 'Mobile Developer' },
    { id: 'emma', name: 'Emma Brown', email: 'emma@company.com', role: 'QA Engineer' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'planning': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'review': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'on-hold': 'bg-gray-100 text-gray-800',
      'todo': 'bg-gray-100 text-gray-800',
      'done': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Flag className="w-4 h-4 text-red-600" />;
      case 'high': return <Flag className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Flag className="w-4 h-4 text-yellow-600" />;
      default: return <Flag className="w-4 h-4 text-green-600" />;
    }
  };

  const getMemberName = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    return member ? member.name : 'Unassigned';
  };

  const getMemberInitials = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return 'U';
    return member.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTask) {
      setTasks(tasks.map(task => 
        task.id === draggedTask.id 
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      ));
      setDraggedTask(null);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.projectId === selectedProject)
    : tasks;

  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    review: filteredTasks.filter(task => task.status === 'review'),
    done: filteredTasks.filter(task => task.status === 'done')
  };

  // Calculate dashboard metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Projects</p>
              <p className="text-3xl font-bold text-white mt-2">{totalProjects}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">{activeProjects} active</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Tasks Completed</p>
              <p className="text-3xl font-bold text-white mt-2">{completedTasks}/{totalTasks}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Award className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-sm font-medium text-emerald-400">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% complete
            </span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Overdue Tasks</p>
              <p className="text-3xl font-bold text-white mt-2">{overdueTasks}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Clock className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm font-medium text-red-400">Need attention</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Budget Used</p>
              <p className="text-3xl font-bold text-white mt-2">
                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-amber-400">
              ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
          <button 
            onClick={() => setShowCreateProject(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.slice(0, 4).map((project) => (
            <div key={project.id} className="bg-gray-700/30 rounded-lg p-6 hover:bg-gray-700/50 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">{project.name}</h4>
                  <p className="text-gray-400 text-sm">{project.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(project.priority)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.assignedTo.slice(0, 3).map((memberId) => (
                    <div key={memberId} className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-800">
                      {getMemberInitials(memberId)}
                    </div>
                  ))}
                  {project.assignedTo.length > 3 && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-800">
                      +{project.assignedTo.length - 3}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  Due {new Date(project.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderKanban = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">Kanban Board</h3>
          <select 
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value || null)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => setShowCreateTask(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div 
            key={status}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status as Task['status'])}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white capitalize">{status.replace('-', ' ')}</h4>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                {statusTasks.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {statusTasks.map((task) => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className="bg-gray-700/50 rounded-lg p-4 cursor-move hover:bg-gray-700/70 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-white text-sm">{task.title}</h5>
                    {getPriorityIcon(task.priority)}
                  </div>
                  
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {getMemberInitials(task.assignedTo)}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      {task.comments > 0 && (
                        <div className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {task.comments}
                        </div>
                      )}
                      {task.attachments > 0 && (
                        <div className="flex items-center">
                          <Paperclip className="w-3 h-3 mr-1" />
                          {task.attachments}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {task.dueDate && (
                    <div className="mt-2 text-xs text-gray-400">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Task List</h3>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value || null)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowCreateTask(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/30 border-b border-gray-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Task</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredTasks.map((task) => {
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <tr key={task.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{task.title}</div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">{task.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{project?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3">
                          {getMemberInitials(task.assignedTo)}
                        </div>
                        <div className="text-sm text-white">{getMemberName(task.assignedTo)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getPriorityIcon(task.priority)}
                        <span className={`ml-2 text-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {task.comments > 0 && (
                          <div className="flex items-center text-gray-400">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            <span className="text-xs">{task.comments}</span>
                          </div>
                        )}
                        {task.attachments > 0 && (
                          <div className="flex items-center text-gray-400">
                            <Paperclip className="w-4 h-4 mr-1" />
                            <span className="text-xs">{task.attachments}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors duration-150">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors duration-150">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-150">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Project Calendar</h3>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200">
            Month
          </button>
          <button className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200">
            Week
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-white mb-2">Calendar View</h4>
          <p className="text-gray-400 mb-4">Interactive calendar with project timelines and deadlines</p>
          <p className="text-sm text-gray-500">Calendar integration coming soon</p>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Project Reports</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Team Performance</h4>
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const memberTasks = tasks.filter(t => t.assignedTo === member.id);
              const completedTasks = memberTasks.filter(t => t.status === 'done').length;
              const completionRate = memberTasks.length > 0 ? (completedTasks / memberTasks.length) * 100 : 0;
              
              return (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {getMemberInitials(member.id)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{member.name}</div>
                      <div className="text-xs text-gray-400">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{completionRate.toFixed(0)}%</div>
                    <div className="text-xs text-gray-400">{completedTasks}/{memberTasks.length} tasks</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Status Overview */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Project Status Overview</h4>
          <div className="space-y-4">
            {['planning', 'in-progress', 'review', 'completed', 'on-hold'].map((status) => {
              const statusProjects = projects.filter(p => p.status === status);
              const percentage = projects.length > 0 ? (statusProjects.length / projects.length) * 100 : 0;
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white capitalize">{status.replace('-', ' ')}</span>
                    <span className="text-gray-400">{statusProjects.length} projects ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Project Management</h1>
          <p className="text-gray-400 mt-2">Manage projects, tasks, and team collaboration</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <div className="border-b border-gray-700/50">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'kanban', label: 'Kanban Board', icon: Kanban },
              { id: 'list', label: 'List View', icon: List },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'reports', label: 'Reports', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === tab.id
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'kanban' && renderKanban()}
          {activeView === 'list' && renderListView()}
          {activeView === 'calendar' && renderCalendar()}
          {activeView === 'reports' && renderReports()}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Project</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Project description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Project budget"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Task</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Task Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project</label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assignee</label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Hours</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                    placeholder="Hours"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;