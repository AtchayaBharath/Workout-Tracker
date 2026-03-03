// Mock API service - Replace this with your real backend API calls
// This structure allows easy integration with a real backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
}

// Auth token management
const TOKEN_KEY = 'ironlog_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Validate and decode token
export const validateToken = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    
    const payload = JSON.parse(atob(parts[0]));
    return !!payload.userId;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// API helper function
const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // For demo purposes, simulate API calls with localStorage
    // In production, replace with real fetch calls
    return await mockApiCall<T>(endpoint, { ...options, headers });
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred',
    };
  }
};

// Mock API implementation - REPLACE THIS WITH REAL API CALLS
const mockApiCall = async <T = any>(
  endpoint: string,
  options: RequestInit
): Promise<ApiResponse<T>> => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay

  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;

  // Get mock database from localStorage
  const getDB = () => {
    const db = localStorage.getItem('ironlog_db');
    return db ? JSON.parse(db) : { users: [], workouts: [], plans: [], exercises: [], nutrition: [], metrics: [] };
  };

  const saveDB = (db: any) => {
    localStorage.setItem('ironlog_db', JSON.stringify(db));
  };

  const getCurrentUser = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
      // Token format: base64(JSON).mock.token
      const parts = token.split('.');
      if (parts.length < 2) return null;
      
      const payload = JSON.parse(atob(parts[0]));
      return payload.userId;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  };

  // Auth endpoints
  if (endpoint === '/auth/signup' && method === 'POST') {
    const db = getDB();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return { success: false, message: 'All fields are required' };
    }

    if (db.users.find((u: any) => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }

    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: btoa(password), // In real app, use bcrypt
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);
    saveDB(db);

    // Generate mock JWT
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email })) + '.mock.token';

    return { success: true, data: { user: { id: user.id, name: user.name, email: user.email } }, token };
  }

  if (endpoint === '/auth/login' && method === 'POST') {
    const db = getDB();
    const { email, password } = body;

    const user = db.users.find((u: any) => u.email === email && u.password === btoa(password));

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    const token = btoa(JSON.stringify({ userId: user.id, email: user.email })) + '.mock.token';

    return { success: true, data: { user: { id: user.id, name: user.name, email: user.email } }, token };
  }

  if (endpoint === '/auth/me' && method === 'GET') {
    const userId = getCurrentUser();
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    const db = getDB();
    const user = db.users.find((u: any) => u.id === userId);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    return { success: true, data: { id: user.id, name: user.name, email: user.email } };
  }

  // Workouts endpoints
  if (endpoint === '/workouts' && method === 'GET') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const db = getDB();
    const workouts = db.workouts.filter((w: any) => w.userId === userId);

    return { success: true, data: workouts };
  }

  if (endpoint === '/workouts' && method === 'POST') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const db = getDB();
    const workout = {
      id: Date.now().toString(),
      userId,
      ...body,
      createdAt: new Date().toISOString(),
    };

    db.workouts.push(workout);
    saveDB(db);

    return { success: true, data: workout };
  }

  if (endpoint.startsWith('/workouts/') && method === 'DELETE') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const workoutId = endpoint.split('/')[2];
    const db = getDB();
    const index = db.workouts.findIndex((w: any) => w.id === workoutId && w.userId === userId);

    if (index === -1) {
      return { success: false, message: 'Workout not found' };
    }

    db.workouts.splice(index, 1);
    saveDB(db);

    return { success: true, message: 'Workout deleted' };
  }

  // Plans endpoints
  if (endpoint === '/plans' && method === 'GET') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const db = getDB();
    const plans = db.plans.filter((p: any) => p.userId === userId);

    return { success: true, data: plans };
  }

  if (endpoint === '/plans' && method === 'POST') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const db = getDB();
    const plan = {
      id: Date.now().toString(),
      userId,
      ...body,
      createdAt: new Date().toISOString(),
    };

    db.plans.push(plan);
    saveDB(db);

    return { success: true, data: plan };
  }

  if (endpoint.startsWith('/plans/') && method === 'DELETE') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const planId = endpoint.split('/')[2];
    const db = getDB();
    const index = db.plans.findIndex((p: any) => p.id === planId && p.userId === userId);

    if (index === -1) {
      return { success: false, message: 'Plan not found' };
    }

    db.plans.splice(index, 1);
    saveDB(db);

    return { success: true, message: 'Plan deleted' };
  }

  // Exercises endpoints
  if (endpoint === '/exercises' && method === 'GET') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const db = getDB();
    const exercises = db.exercises.filter((e: any) => e.userId === userId);

    return { success: true, data: exercises };
  }

  if (endpoint === '/exercises' && method === 'POST') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const db = getDB();
    const exercise = {
      id: Date.now().toString(),
      userId,
      ...body,
      createdAt: new Date().toISOString(),
    };

    db.exercises.push(exercise);
    saveDB(db);

    return { success: true, data: exercise };
  }

  // Nutrition endpoints
  if (endpoint === '/nutrition' && method === 'GET') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const db = getDB();
    const nutrition = db.nutrition.filter((n: any) => n.userId === userId);

    return { success: true, data: nutrition };
  }

  if (endpoint === '/nutrition' && method === 'POST') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const db = getDB();
    const entry = {
      id: Date.now().toString(),
      userId,
      ...body,
      createdAt: new Date().toISOString(),
    };

    db.nutrition.push(entry);
    saveDB(db);

    return { success: true, data: entry };
  }

  if (endpoint.startsWith('/nutrition/') && method === 'DELETE') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const entryId = endpoint.split('/')[2];
    const db = getDB();
    const index = db.nutrition.findIndex((n: any) => n.id === entryId && n.userId === userId);

    if (index === -1) {
      return { success: false, message: 'Entry not found' };
    }

    db.nutrition.splice(index, 1);
    saveDB(db);

    return { success: true, message: 'Entry deleted' };
  }

  // Metrics endpoints
  if (endpoint === '/metrics' && method === 'GET') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const db = getDB();
    const metrics = db.metrics.filter((m: any) => m.userId === userId);

    return { success: true, data: metrics };
  }

  if (endpoint === '/metrics' && method === 'POST') {
    const userId = getCurrentUser();
    if (!userId) return { success: false, message: 'Unauthorized' };

    const db = getDB();
    const metric = {
      id: Date.now().toString(),
      userId,
      ...body,
      createdAt: new Date().toISOString(),
    };

    db.metrics.push(metric);
    saveDB(db);

    return { success: true, data: metric };
  }

  return { success: false, message: 'Endpoint not found' };
};

// API functions
export const api = {
  // Auth
  signup: (data: { name: string; email: string; password: string }) =>
    apiCall('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getCurrentUser: () => apiCall('/auth/me'),

  // Workouts
  getWorkouts: () => apiCall('/workouts'),
  
  createWorkout: (data: any) =>
    apiCall('/workouts', { method: 'POST', body: JSON.stringify(data) }),
  
  deleteWorkout: (id: string) =>
    apiCall(`/workouts/${id}`, { method: 'DELETE' }),

  // Plans
  getPlans: () => apiCall('/plans'),
  
  createPlan: (data: any) =>
    apiCall('/plans', { method: 'POST', body: JSON.stringify(data) }),
  
  deletePlan: (id: string) =>
    apiCall(`/plans/${id}`, { method: 'DELETE' }),

  // Exercises
  getExercises: () => apiCall('/exercises'),
  
  createExercise: (data: any) =>
    apiCall('/exercises', { method: 'POST', body: JSON.stringify(data) }),

  // Nutrition
  getNutrition: () => apiCall('/nutrition'),
  
  createNutritionEntry: (data: any) =>
    apiCall('/nutrition', { method: 'POST', body: JSON.stringify(data) }),
  
  deleteNutritionEntry: (id: string) =>
    apiCall(`/nutrition/${id}`, { method: 'DELETE' }),

  // Metrics
  getMetrics: () => apiCall('/metrics'),
  
  createMetric: (data: any) =>
    apiCall('/metrics', { method: 'POST', body: JSON.stringify(data) }),
};