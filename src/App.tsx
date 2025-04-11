import React, { useState, useEffect } from 'react';
import { Plus, Search, Check, X, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  category: string;
  completed: boolean;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [isEditing, setIsEditing] = useState(false);

  const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `http://localhost:5000/api/tasks/${currentTask._id}`
        : 'http://localhost:5000/api/tasks';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTask),
      });

      if (response.ok) {
        fetchTasks();
        setIsModalOpen(false);
        setCurrentTask({});
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...task, completed: !task.completed }),
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">TaskMate</h1>
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsEditing(false);
                setCurrentTask({});
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} /> Add Task
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="border rounded-lg px-4 py-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div
                key={task._id}
                className={`border rounded-lg p-4 ${task.completed ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    <p className={`mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleComplete(task)}
                      className={`p-2 rounded-full ${
                        task.completed
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      } hover:bg-opacity-80 transition-colors`}
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTask(task);
                        setIsEditing(true);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-opacity-80 transition-colors"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-opacity-80 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {isEditing ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-4 py-2"
                  value={currentTask.title || ''}
                  onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  className="w-full border rounded-lg px-4 py-2"
                  value={currentTask.description || ''}
                  onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full border rounded-lg px-4 py-2"
                  value={currentTask.dueDate ? currentTask.dueDate.split('T')[0] : ''}
                  onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  required
                  className="w-full border rounded-lg px-4 py-2"
                  value={currentTask.category || ''}
                  onChange={(e) => setCurrentTask({ ...currentTask, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {isEditing ? 'Update Task' : 'Add Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;