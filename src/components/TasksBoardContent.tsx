import { useState } from 'react'
import {
  Grid2X2,
  Link,
  Bookmark,
  Share2,
  BarChart3,
  Cloud,
  Settings,
  MoreHorizontal,
  RotateCw,
  Users,
  Calendar,
  Pause,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Folder,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';


interface TaskItem {
  id: string;
  title: string;
  author: string;
  avatar: string;
  date: string;
  bgColor: string;
  progress: number;
  subtasks: string[];
  hasBookmark?: boolean;
  hasPause?: boolean;
}


interface ProjectItem {
  id: string;
  name: string;
  category: string;
  status: string;
  bgColor: string;
  completedTasks: number;
  totalTasks: number;
  dueDate: string;
  team: string[];
  hasBookmark?: boolean;
}


export function TasksBoardContent() {
  const [activeTab, setActiveTab] = useState<'Project' | 'Task' | 'Report'>('Task');


  // DATA PROJECT
  const projects: ProjectItem[] = [
    {
      id: 'p1',
      name: 'E-Commerce Platform Redesign',
      category: 'UI/UX Design',
      status: 'In Progress',
      bgColor: 'bg-[#F9D0F1]',
      completedTasks: 12,
      totalTasks: 16,
      dueDate: '28.11.23',
      team: ['https://i.pravatar.cc/100?img=5', 'https://i.pravatar.cc/100?img=12', 'https://i.pravatar.cc/100?img=9'],
      hasBookmark: true,
    },
    {
      id: 'p2',
      name: 'Mobile App Infrastructure',
      category: 'Backend Dev',
      status: 'In Review',
      bgColor: 'bg-[#E3DCFA]',
      completedTasks: 8,
      totalTasks: 10,
      dueDate: '02.12.23',
      team: ['https://i.pravatar.cc/100?img=11', 'https://i.pravatar.cc/100?img=13'],
    },
    {
      id: 'p3',
      name: 'Q4 Global Marketing Strategy',
      category: 'Marketing',
      status: 'Urgent',
      bgColor: 'bg-[#F2D00D]',
      completedTasks: 15,
      totalTasks: 20,
      dueDate: '10.12.23',
      team: ['https://i.pravatar.cc/100?img=5', 'https://i.pravatar.cc/100?img=9'],
      hasBookmark: true,
    },
    {
      id: 'p4',
      name: 'Internal Operations Automation',
      category: 'DevOps',
      status: 'Planning',
      bgColor: 'bg-[#EAEAEA]',
      completedTasks: 3,
      totalTasks: 12,
      dueDate: '15.01.24',
      team: ['https://i.pravatar.cc/100?img=12', 'https://i.pravatar.cc/100?img=11', 'https://i.pravatar.cc/100?img=13'],
    },
    {
      id: 'p5',
      name: 'Employee Onboarding System',
      category: 'Human Resource',
      status: 'Completed',
      bgColor: 'bg-[#E3DCFA]',
      completedTasks: 8,
      totalTasks: 8,
      dueDate: '01.11.23',
      team: ['https://i.pravatar.cc/100?img=9'],
    },
    {
      id: 'p6',
      name: 'Customer Feedback Portal',
      category: 'Product Research',
      status: 'In Progress',
      bgColor: 'bg-[#F9D0F1]',
      completedTasks: 6,
      totalTasks: 9,
      dueDate: '20.12.23',
      team: ['https://i.pravatar.cc/100?img=5', 'https://i.pravatar.cc/100?img=12'],
    },
  ];


  // DATA KANBAN TASKS
  const col1: TaskItem[] = [
    {
      id: '1',
      title: 'Develop Processing Plans',
      author: 'Clair Burge',
      avatar: 'https://i.pravatar.cc/100?img=5',
      date: '12.11.23',
      bgColor: 'bg-[#F9D0F1]',
      progress: 2,
      subtasks: ['Workflow Mapping', 'Resource Allocation', 'Risk Assessment', 'Final Review'],
      hasBookmark: true,
    },
    {
      id: '2',
      title: 'Develop Strategic Plans',
      author: 'Christian Bass',
      avatar: 'https://i.pravatar.cc/100?img=12',
      date: '15.11.23',
      bgColor: 'bg-[#F9D0F1]',
      progress: 3,
      subtasks: ['Market Analysis', 'Competitor Research', 'KPI Setting', 'Budget Approval'],
    },
    {
      id: '3',
      title: 'Build Relationships',
      author: 'Craig Curry',
      avatar: 'https://i.pravatar.cc/100?img=11',
      date: '21.11.23',
      bgColor: 'bg-[#EAEAEA]',
      progress: 4,
      subtasks: ['Client Outreach', 'Initial Meeting', 'Contract Proposal', 'Partnership Signed'],
    },
    {
      id: '4',
      title: 'Create Training Programs',
      author: 'Brandon Crawford',
      avatar: 'https://i.pravatar.cc/100?img=13',
      date: '23.11.23',
      bgColor: 'bg-[#EAEAEA]',
      progress: 1,
      subtasks: ['Curriculum Draft', 'Video Recording', 'Quiz Creation', 'Platform Upload'],
    },
  ];


  const col2: TaskItem[] = [
    {
      id: '5',
      title: 'Resolve Payment Disputes',
      author: 'Clair Burge',
      avatar: 'https://i.pravatar.cc/100?img=5',
      date: '8.11.23',
      bgColor: 'bg-[#E3DCFA]',
      progress: 3,
      subtasks: ['Log Inquiry', 'Bank Verification', 'Refund Processing', 'Customer Confirmation'],
    },
    {
      id: '6',
      title: 'Provide Customer Service',
      author: 'Christian Bass',
      avatar: 'https://i.pravatar.cc/100?img=12',
      date: '9.11.23',
      bgColor: 'bg-[#E3DCFA]',
      progress: 2,
      subtasks: ['Ticket Triage', 'Issue Diagnosis', 'Solution Testing', 'Closure Call'],
      hasBookmark: true,
    },
    {
      id: '7',
      title: 'Resolve Disputes',
      author: 'Brandon Crawford',
      avatar: 'https://i.pravatar.cc/100?img=13',
      date: '20.11.23',
      bgColor: 'bg-[#EAEAEA]',
      progress: 3,
      subtasks: ['Gather Evidence', 'Legal Consult', 'Mediation Session', 'Agreement Draft'],
    },
    {
      id: '8',
      title: 'Develop Processing Plans',
      author: 'Helna Julie',
      avatar: 'https://i.pravatar.cc/100?img=9',
      date: '22.11.23',
      bgColor: 'bg-[#E3DCFA]',
      progress: 2,
      subtasks: ['System Audit', 'Bottleneck Identification', 'New Flow Design', 'Rollout Strategy'],
      hasBookmark: true,
    },
  ];


  const col3: TaskItem[] = [
    {
      id: '9',
      title: 'Train Employees',
      author: 'Craig Curry',
      avatar: 'https://i.pravatar.cc/100?img=11',
      date: '8.11.23',
      bgColor: 'bg-[#E3DCFA]',
      progress: 3,
      subtasks: ['Schedule Session', 'Material Preparation', 'Live Workshop', 'Feedback Survey'],
    },
    {
      id: '10',
      title: 'Improve Efficiency',
      author: 'Christian Bass',
      avatar: 'https://i.pravatar.cc/100?img=12',
      date: '10.11.23',
      bgColor: 'bg-[#F2F2F0]',
      progress: 2,
      subtasks: ['Time Tracking', 'Automation Setup', 'Team Alignment', 'Performance Metric'],
    },
    {
      id: '11',
      title: 'Report To Management',
      author: 'Clair Burge',
      avatar: 'https://i.pravatar.cc/100?img=5',
      date: '14.11.23',
      bgColor: 'bg-[#E3DCFA]',
      progress: 3,
      subtasks: ['Data Extraction', 'Slide Deck Creation', 'Executive Summary', 'Presentation'],
    },
  ];


  const col4: TaskItem[] = [
    {
      id: '12',
      title: 'Recruit New Talent',
      author: 'Helna Julie',
      avatar: 'https://i.pravatar.cc/100?img=9',
      date: '4.11.23',
      bgColor: 'bg-[#F2D00D]',
      progress: 3,
      subtasks: ['Job Posting', 'CV Screening', 'Technical Interview', 'Offer Letter'],
    },
    {
      id: '13',
      title: 'Market Services',
      author: 'Clair Burge',
      avatar: 'https://i.pravatar.cc/100?img=5',
      date: '5.11.23',
      bgColor: 'bg-[#F2D00D]',
      progress: 2,
      subtasks: ['Ad Copywriting', 'Banner Design', 'Campaign Launch', 'ROAS Tracking'],
    },
  ];


  const col5: TaskItem[] = [
    {
      id: '14',
      title: 'Oversee Operations',
      author: 'Christian Bass',
      avatar: 'https://i.pravatar.cc/100?img=12',
      date: '11.2.23',
      bgColor: 'bg-[#EAEAEA]',
      progress: 2,
      subtasks: ['Daily Standup', 'Inventory Check', 'Vendor Sync', 'Logistics Report'],
    },
    {
      id: '15',
      title: 'Implement New Technologies',
      author: 'Clair Burge',
      avatar: 'https://i.pravatar.cc/100?img=5',
      date: '4.12.23',
      bgColor: 'bg-[#EAEAEA]',
      progress: 3,
      subtasks: ['Vendor Selection', 'API Integration', 'Beta Testing', 'Full Migration'],
    },
    {
      id: '16',
      title: 'Launch Marketing Campaigns',
      author: 'Brandon Crawford',
      avatar: 'https://i.pravatar.cc/100?img=13',
      date: '5.02.24',
      bgColor: 'bg-[#EAEAEA]',
      progress: 1,
      subtasks: ['Content Strategy', 'Influencer Outreach', 'PR Distribution', 'Analytics Setup'],
      hasPause: true,
    },
    {
      id: '17',
      title: 'Oversee Operations',
      author: 'Helna Julie',
      avatar: 'https://i.pravatar.cc/100?img=9',
      date: '6.12.23',
      bgColor: 'bg-[#EAEAEA]',
      progress: 1,
      subtasks: ['Shift Scheduling', 'Facility Inspection', 'Compliance Check', 'Incident Log'],
    },
  ];


  return (
    <div className="h-full overflow-y-auto bg-[#F6F5F2] text-zinc-900 p-6 md:p-8 font-sans">
      {/* NAVIGATION TAB PILL */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-zinc-200/80 p-1 rounded-full flex items-center gap-1 w-fit border border-zinc-300/40 backdrop-blur-md">
          {(['Project', 'Task', 'Report'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>


        <div className="hidden sm:flex items-center gap-2">
          <IconButton icon={<Grid2X2 className="w-3.5 h-3.5 text-white" />} active />
          <IconButton icon={<Link className="w-3.5 h-3.5" />} />
          <IconButton icon={<Share2 className="w-3.5 h-3.5" />} />
        </div>
      </div>


      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {activeTab === 'Project' && 'Active Workspaces'}
            {activeTab === 'Task' && 'Task Schedule'}
            {activeTab === 'Report' && 'Analytics & Performance'}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mt-1">
            {activeTab === 'Project' && 'Project Overview'}
            {activeTab === 'Task' && 'Daily Operation'}
            {activeTab === 'Report' && 'Performance Reports'}
          </h1>
        </div>


        {/* CONTROLS & METRICS */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 w-full lg:w-auto">
          {activeTab === 'Task' && (
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-medium shadow-sm">
                Still Running
                <span className="bg-[#F2D00D] text-black font-bold px-1.5 py-0.5 rounded-full text-[10px]">32</span>
              </button>


              <button className="flex items-center gap-1 bg-white text-zinc-600 px-4 py-2 rounded-full text-xs font-medium border border-zinc-200 hover:bg-zinc-50 transition">
                Disqualified
                <span className="text-zinc-400 text-[10px]">▼</span>
              </button>
            </div>
          )}


          {activeTab === 'Project' && (
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm hover:bg-zinc-800 transition">
                + New Project
              </button>
            </div>
          )}


          <div className="flex items-center gap-8 border-l border-zinc-300 pl-6">
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Week's Tasks</p>
              <p className="text-2xl font-bold text-zinc-900">132</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Pending Approval</p>
              <p className="text-2xl font-bold text-zinc-900">34</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Employees involved</p>
              <p className="text-2xl font-bold text-zinc-900">22</p>
            </div>
          </div>


          <div className="flex items-center gap-1.5 border-l border-zinc-300 pl-4">
            <IconButton icon={<BarChart3 className="w-4 h-4" />} />
            <IconButton icon={<Cloud className="w-4 h-4" />} />
            <IconButton icon={<Settings className="w-4 h-4" />} />
          </div>
        </div>
      </header>


      {/* TAB CONTENT: PROJECT VIEW */}
      {activeTab === 'Project' && (
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}


          {/* New Project Dotted Card */}
          <div className="h-64 rounded-3xl p-6 border-2 border-dashed border-zinc-300/80 hover:border-zinc-500 transition flex flex-col items-center justify-center gap-3 cursor-pointer group bg-white/30">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-zinc-200 flex items-center justify-center group-hover:scale-110 transition duration-200">
              <Folder className="w-5 h-5 text-zinc-600" />
            </div>
            <span className="text-sm font-semibold text-zinc-700">Create New Workspace</span>
            <p className="text-xs text-zinc-400 text-center max-w-[200px]">Organize tasks, assign team members & track goals</p>
          </div>
        </main>
      )}


      {/* TAB CONTENT: TASK (KANBAN) VIEW */}
      {activeTab === 'Task' && (
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          <div className="flex flex-col gap-4">
            {col1.map((item) => <Card key={item.id} item={item} />)}
          </div>
          <div className="flex flex-col gap-4">
            {col2.map((item) => <Card key={item.id} item={item} />)}
          </div>
          <div className="flex flex-col gap-4">
            {col3.map((item) => <Card key={item.id} item={item} />)}
          </div>
          <div className="flex flex-col gap-4">
            {col4.map((item) => <Card key={item.id} item={item} />)}

            <div
              className="h-36 rounded-3xl p-4 flex items-center justify-center border border-zinc-200/60 shadow-xs relative overflow-hidden"
              style={{
                backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.04) 10px, transparent 10px, transparent 20px)'
              }}
            >
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-2 rounded-full shadow-md border border-zinc-100">
                <button className="p-2 rounded-full hover:bg-zinc-100 transition"><RotateCw className="w-3.5 h-3.5 text-zinc-600" /></button>
                <button className="p-2 rounded-full hover:bg-zinc-100 transition"><Cloud className="w-3.5 h-3.5 text-zinc-600" /></button>
                <button className="p-2 rounded-full hover:bg-zinc-100 transition"><Users className="w-3.5 h-3.5 text-zinc-600" /></button>
                <button className="p-2 rounded-full hover:bg-zinc-100 transition"><Calendar className="w-3.5 h-3.5 text-zinc-600" /></button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {col5.map((item) => <Card key={item.id} item={item} />)}
          </div>
        </main>
      )}


      {/* TAB CONTENT: REPORT VIEW */}
      {activeTab === 'Report' && (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#E3DCFA] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Weekly Output</span>
                <TrendingUp className="w-4 h-4 text-zinc-700" />
              </div>
              <h2 className="text-4xl font-extrabold text-zinc-900">88.4%</h2>
              <p className="text-xs text-zinc-600 mt-1 font-medium">+12% higher completion rate vs last week</p>
            </div>
            <div className="mt-8 bg-white/60 backdrop-blur-xs p-4 rounded-2xl border border-white/40">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span>Task Throughput</span>
                <span>132 / 150</span>
              </div>
              <div className="h-2 bg-zinc-900/10 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 rounded-full w-[88%]" />
              </div>
            </div>
          </div>


          <div className="bg-[#F9D0F1] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Active Contributors</span>
                <Users className="w-4 h-4 text-zinc-700" />
              </div>
              <h2 className="text-4xl font-extrabold text-zinc-900">22 Members</h2>
              <p className="text-xs text-zinc-600 mt-1 font-medium">All departments currently actively logging tasks</p>
            </div>
            <div className="mt-8 flex -space-x-2">
              {['5', '12', '11', '9', '13'].map((img, i) => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${img}`} className="w-9 h-9 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
          </div>


          <div className="bg-[#F2D00D] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900/80">Pending Reviews</span>
                <Clock className="w-4 h-4 text-zinc-900" />
              </div>
              <h2 className="text-4xl font-extrabold text-zinc-900">34 Items</h2>
              <p className="text-xs text-zinc-800 mt-1 font-medium">Requires management sign-off by EOD</p>
            </div>
            <button className="mt-8 bg-zinc-900 text-white rounded-full py-2.5 px-4 text-xs font-medium flex items-center justify-between hover:bg-zinc-800 transition">
              Review Pending Items
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      )}
    </div>
  );
}


function IconButton({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
      active ? 'bg-black text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
    }`}>
      {icon}
    </button>
  );
}


function ProjectCard({ project }: { project: ProjectItem }) {
  const percentage = Math.round((project.completedTasks / project.totalTasks) * 100);


  return (
    <div className={`${project.bgColor} rounded-3xl p-6 flex flex-col justify-between h-64 shadow-xs relative hover:-translate-y-1 transition-all duration-300 group`}>
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600/90 bg-white/40 px-2.5 py-1 rounded-full">
            {project.category}
          </span>
          <div className="flex items-center gap-1.5">
            {project.hasBookmark && (
              <div className="bg-zinc-900 text-white p-1.5 rounded-full shadow-xs">
                <Bookmark className="w-3 h-3 fill-current" />
              </div>
            )}
            <button className="text-zinc-600 hover:text-black p-1 rounded-full">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>


        <h3 className="font-bold text-lg leading-snug text-zinc-900 mt-1">{project.name}</h3>
      </div>


      {/* Progress Section */}
      <div className="my-2">
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-zinc-800">
          <span>{project.completedTasks} / {project.totalTasks} Tasks Completed</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-900/10 overflow-hidden">
          <div
            className="h-full bg-zinc-900 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>


      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-zinc-900/10">
        <div className="flex -space-x-2">
          {project.team.map((avatar, idx) => (
            <img
              key={idx}
              src={avatar}
              alt="team member"
              className="w-7 h-7 rounded-full object-cover border-2 border-white/70"
            />
          ))}
        </div>


        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-600 bg-white/60 px-2.5 py-1 rounded-full">
            Due {project.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
}


function Card({ item }: { item: TaskItem }) {
  const [isExpanded, setIsExpanded] = useState(false);


  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`${item.bgColor} rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 ease-in-out cursor-pointer shadow-xs relative group ${
        isExpanded ? 'min-h-[22rem] ring-2 ring-zinc-900/10 shadow-lg' : 'h-44 hover:-translate-y-1'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-sm leading-snug text-zinc-900 pr-2">{item.title}</h3>
        <div className="flex items-center gap-1">
          <span className="p-1 text-zinc-500 group-hover:text-black transition">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-zinc-500 hover:text-black p-1 rounded-full"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>


      <div className="flex gap-1.5 my-2">
        {item.subtasks.map((_, index) => {
          const isCompleted = index < item.progress;
          return (
            <div key={index} className="flex-1 py-1">
              <div
                className={`h-1.5 rounded-full w-full transition-all duration-200 ${
                  isCompleted ? 'bg-zinc-900' : 'bg-zinc-900/15'
                }`}
              />
            </div>
          );
        })}
      </div>


      {isExpanded && (
        <div className="my-3 pt-3 border-t border-zinc-900/10 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Subtask Breakdown</span>
            <span className="text-[10px] font-medium text-zinc-500">{item.progress}/{item.subtasks.length} Done</span>
          </div>


          <div className="flex flex-col gap-1.5">
            {item.subtasks.map((subName, idx) => {
              const isCompleted = idx < item.progress;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition ${
                    isCompleted ? 'bg-white/40 text-zinc-500' : 'bg-white/80 font-medium text-zinc-900 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    )}
                    <span className={`truncate ${isCompleted ? 'line-through text-zinc-500' : ''}`}>
                      {subName}
                    </span>
                  </div>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    isCompleted ? 'bg-zinc-900/10 text-zinc-700' : 'bg-amber-500/20 text-amber-900'
                  }`}>
                    {isCompleted ? 'Done' : 'In Progress'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}


      <div className="flex justify-between items-end mt-auto pt-2">
        <div className="flex items-center gap-2.5">
          <img
            src={item.avatar}
            alt={item.author}
            className="w-7 h-7 rounded-full object-cover border border-white/50"
          />
          <div>
            <p className="text-xs font-semibold text-zinc-900 leading-tight">{item.author}</p>
            <p className="text-[10px] text-zinc-500 font-medium">{item.date}</p>
          </div>
        </div>


        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {item.hasBookmark && (
            <div className="bg-zinc-900 text-white p-2 rounded-full shadow-md" title="Bookmarked">
              <Bookmark className="w-3 h-3 fill-current" />
            </div>
          )}


          {item.hasPause && (
            <div className="bg-rose-500 text-white p-2 rounded-full shadow-md animate-pulse" title="Blocked / Paused">
              <Pause className="w-3 h-3 fill-current" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
