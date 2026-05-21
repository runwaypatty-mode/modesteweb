/**
 * E-Learning Website JavaScript
 * Uses localStorage for data persistence
 * Can connect to real MySQL database via PHP API
 */

// ================= CONFIGURATION =================
const CONFIG = {
    dbName: 'elearning_db',
    adminEmail: 'admin@elearning.com',
    adminPassword: 'admin123'
};

// ================= DATABASE SIMULATION (localStorage) =================
class Database {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize users
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 1,
                    full_name: 'Administrator',
                    email: CONFIG.adminEmail,
                    password: this.hashPassword(CONFIG.adminPassword),
                    role: 'admin',
                    status: 'active',
                    created_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Initialize messages
        if (!localStorage.getItem('messages')) {
            localStorage.setItem('messages', JSON.stringify([]));
        }

        // Initialize books
        if (!localStorage.getItem('books')) {
            const defaultBooks = [
                { id: 1, title: 'Software Development L3', description: 'RTB Curriculum for Software Development Level 3', category: 'Software Development', author: 'RTB', views: 150 },
                { id: 2, title: 'Web Development Basics', description: 'Introduction to HTML, CSS, and JavaScript', category: 'Web Development', author: 'Instructor', views: 200 },
                { id: 3, title: 'Database Management', description: 'Learn MySQL and database design', category: 'Database', author: 'Instructor', views: 180 }
            ];
            localStorage.setItem('books', JSON.stringify(defaultBooks));
        }

        // Initialize services
        if (!localStorage.getItem('services')) {
            const defaultServices = [
                { id: 1, title: 'E-learning Materials', icon: '📚' },
                { id: 2, title: 'RTB Software Development Books', icon: '📖' },
                { id: 3, title: 'ICT Tutorials', icon: '💻' },
                { id: 4, title: 'Music & Multimedia', icon: '🎵' }
            ];
            localStorage.setItem('services', JSON.stringify(defaultServices));
        }

        // Initialize gallery
        if (!localStorage.getItem('gallery')) {
            const defaultGallery = [
                { id: 1, title: 'Welcome Image', image: 'https://via.placeholder.com/400x300?text=Welcome', description: 'Welcome to our platform' },
                { id: 2, title: 'Student Learning', image: 'https://via.placeholder.com/400x300?text=Study', description: 'Students learning ICT' }
            ];
            localStorage.setItem('gallery', JSON.stringify(defaultGallery));
        }

        // Initialize courses
        if (!localStorage.getItem('courses')) {
            const defaultCourses = [
                { id: 1, title: 'HTML & CSS Basics', description: 'Learn the fundamentals of HTML and CSS', category: 'Web Development', instructor: 'Instructor', duration: '10 hours', level: 'beginner', enrolled: 0 },
                { id: 2, title: 'PHP Programming', description: 'Server-side programming with PHP', category: 'Programming', instructor: 'Instructor', duration: '15 hours', level: 'intermediate', enrolled: 0 },
                { id: 3, title: 'MySQL Database', description: 'Database design and management', category: 'Database', instructor: 'Instructor', duration: '12 hours', level: 'intermediate', enrolled: 0 }
            ];
            localStorage.setItem('courses', JSON.stringify(defaultCourses));
        }
    }

    // Simple hash function for passwords
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    // User methods
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    }

    getUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    }

    addUser(user) {
        const users = this.getUsers();
        user.id = users.length + 1;
        user.role = 'user';
        user.status = 'active';
        user.created_at = new Date().toISOString();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }

    updateUser(id, data) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...data };
            localStorage.setItem('users', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    // Messages methods
    getMessages() {
        return JSON.parse(localStorage.getItem('messages')) || [];
    }

    addMessage(message) {
        const messages = this.getMessages();
        message.id = messages.length + 1;
        message.status = 'unread';
        message.created_at = new Date().toISOString();
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
        return message;
    }

    // Books methods
    getBooks() {
        return JSON.parse(localStorage.getItem('books')) || [];
    }

    // Services methods
    getServices() {
        return JSON.parse(localStorage.getItem('services')) || [];
    }

    // Gallery methods
    getGallery() {
        return JSON.parse(localStorage.getItem('gallery')) || [];
    }

    // Courses methods
    getCourses() {
        return JSON.parse(localStorage.getItem('courses')) || [];
    }

    enrollCourse(userId, courseId) {
        const courses = this.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (course) {
            course.enrolled = (course.enrolled || 0) + 1;
            localStorage.setItem('courses', JSON.stringify(courses));
            return true;
        }
        return false;
    }

    // Statistics
    getStats() {
        const users = this.getUsers();
        const messages = this.getMessages();
        const books = this.getBooks();
        const courses = this.getCourses();
        
        return {
            totalUsers: users.length,
            totalMessages: messages.length,
            unreadMessages: messages.filter(m => m.status === 'unread').length,
            totalBooks: books.length,
            totalCourses: courses.length,
            totalEnrollments: courses.reduce((sum, c) => sum + (c.enrolled || 0), 0)
        };
    }
}

// Initialize database
const db = new Database();

// ================= AUTHENTICATION =================
const Auth = {
    currentUser: null,

    init() {
        const session = localStorage.getItem('currentUser');
        if (session) {
            this.currentUser = JSON.parse(session);
        }
    },

    login(email, password) {
        const user = db.getUserByEmail(email);
        if (user && user.password === db.hashPassword(password)) {
            if (user.status === 'active') {
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                return { success: true, user };
            } else {
                return { success: false, message: 'Your account is suspended.' };
            }
        }
        return { success: false, message: 'Invalid email or password.' };
    },

    register(data) {
        if (db.getUserByEmail(data.email)) {
            return { success: false, message: 'Email already registered.' };
        }
        
        const user = db.addUser({
            full_name: data.full_name,
            email: data.email,
            password: db.hashPassword(data.password)
        });
        
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    isLoggedIn() {
        return this.currentUser !== null;
    },

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
};

// Initialize auth
Auth.init();

// ================= UI FUNCTIONS =================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showService(service) {
    showNotification(`Opening ${service}...`, 'success');
}

function loadBooks() {
    const books = db.getBooks();
    const grid = document.getElementById('bookGrid');
    if (grid) {
        grid.innerHTML = books.map(book => `
            <div class="book-card">
                <h3>${book.title}</h3>
                <p>${book.description}</p>
                <button class="btn" onclick="showNotification('Coming Soon!', 'success')">Read</button>
            </div>
        `).join('');
    }
}

function loadGallery() {
    const gallery = db.getGallery();
    const grid = document.getElementById('galleryGrid');
    if (grid) {
        grid.innerHTML = gallery.map(item => `
            <div class="photo-item">
                <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <h4>${item.title}</h4>
            </div>
        `).join('');
    }
}

function loadServices() {
    console.log('Services loaded from database');
}

// ================= ANIMATIONS =================
function initAnimations() {
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

// ================= FORM HANDLERS =================
function handleContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    if (name && email && message) {
        db.addMessage({ name, email, message });
        
        document.getElementById('formSuccess').style.display = 'block';
        document.getElementById('formSuccess').textContent = 'Thank you! Your message has been sent successfully.';
        document.getElementById('contactForm').reset();
        
        showNotification('Message sent successfully!', 'success');
        
        setTimeout(() => {
            document.getElementById('formSuccess').style.display = 'none';
        }, 5000);
    }
}

function handleLoginForm(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = Auth.login(email, password);
    
    if (result.success) {
        showNotification('Login successful!', 'success');
        setTimeout(() => {
            if (result.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 1000);
    } else {
        showNotification(result.message, 'error');
    }
}

function handleRegisterForm(e) {
    e.preventDefault();
    
    const full_name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }
    
    const result = Auth.register({ full_name, email, password });
    
    if (result.success) {
        showNotification('Registration successful!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showNotification(result.message, 'error');
    }
}

// ================= DASHBOARD FUNCTIONS =================
function loadDashboardStats() {
    const stats = db.getStats();
    
    const statsHTML = `
        <div class="dashboard-card">
            <div class="icon"><i class="fas fa-users"></i></div>
            <h3>Total Users</h3>
            <div class="number">${stats.totalUsers}</div>
        <div class="dashboard-card">
            <div class="icon"><i class="fas fa-envelope"></i></div>
            <h3>Messages</h3>
            <div class="number">${stats.totalMessages}</div>
        <div class="dashboard-card">
            <div class="icon"><i class="fas fa-book"></i></div>
            <h3>Books</h3>
            <div class="number">${stats.totalBooks}</div>
        <div class="dashboard-card">
            <div class="icon"><i class="fas fa-graduation-cap"></i></div>
            <h3>Courses</h3>
            <div class="number">${stats.totalCourses}</div>
    `;
    
    const statsContainer = document.getElementById('dashboardStats');
    if (statsContainer) {
        statsContainer.innerHTML = statsHTML;
    }
}

function loadUserCourses() {
    const courses = db.getCourses();
    const container = document.getElementById('userCourses');
    if (container) {
        container.innerHTML = courses.map(course => `
            <div class="book-card">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <p><strong>Duration:</strong> ${course.duration}</p>
                <p><strong>Level:</strong> ${course.level}</p>
                <button class="btn" onclick="enrollCourse(${course.id})">Enroll Now</button>
            </div>
        `).join('');
    }
}

function enrollCourse(courseId) {
    if (!Auth.isLoggedIn()) {
        showNotification('Please login first!', 'error');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    
    db.enrollCourse(Auth.currentUser.id, courseId);
    showNotification('Enrolled successfully!', 'success');
}

function loadAdminMessages() {
    const messages = db.getMessages();
    const container = document.getElementById('adminMessages');
    if (container) {
        container.innerHTML = messages.length > 0 ? messages.map(msg => `
            <tr>
                <td>${msg.name}</td>
                <td>${msg.email}</td>
                <td>${msg.message.substring(0, 50)}...</td>
                <td><span class="status-badge status-${msg.status}">${msg.status}</span></td>
                <td>${new Date(msg.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('') : '<tr><td colspan="5">No messages yet.</td></tr>';
    }
}

function loadAdminUsers() {
    const users = db.getUsers();
    const container = document.getElementById('adminUsers');
    if (container) {
        container.innerHTML = users.map(user => `
            <tr>
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                <td>${user.role}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }
}

function loadAdminCourses() {
    const courses = db.getCourses();
    const container = document.getElementById('adminCourses');
    if (container) {
        container.innerHTML = courses.map(course => `
            <tr>
                <td>${course.title}</td>
                <td>${course.category}</td>
                <td>${course.instructor}</td>
                <td>${course.duration}</td>
                <td>${course.enrolled || 0}</td>
            </tr>
        `).join('');
    }
}

// ================= MOBILE MENU =================
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            
            if (navMenu.style.display === 'flex') {
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '70px';
                navMenu.style.left = '0';
                navMenu.style.right = '0';
                navMenu.style.background = '#0a1f44';
                navMenu.style.padding = '20px';
            }
        });
    }
}

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations
    initAnimations();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Load dynamic content
    loadBooks();
    loadGallery();
    loadServices();
    
    // Setup contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Setup login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginForm);
    }
    
    // Setup register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterForm);
    }
    
    // Load dashboard if on dashboard page
    if (document.getElementById('dashboardStats')) {
        loadDashboardStats();
        loadUserCourses();
    }
    
    // Load admin data if on admin page
    if (document.getElementById('adminMessages')) {
        loadAdminMessages();
        loadAdminUsers();
        loadAdminCourses();
    }
    
    console.log('E-Learning Website Initialized');
});
