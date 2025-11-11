// Toast Notification System
class ToastNotification {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full';
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        const id = 'toast-' + Date.now();
        toast.id = id;
        
        const colors = {
            success: {
                bg: 'bg-green-900',
                border: 'border-green-700',
                text: 'text-green-200',
                icon: '✓'
            },
            error: {
                bg: 'bg-red-900',
                border: 'border-red-700',
                text: 'text-red-200',
                icon: '✕'
            },
            warning: {
                bg: 'bg-yellow-900',
                border: 'border-yellow-700',
                text: 'text-yellow-200',
                icon: '⚠'
            },
            info: {
                bg: 'bg-blue-900',
                border: 'border-blue-700',
                text: 'text-blue-200',
                icon: 'ℹ'
            }
        };

        const color = colors[type] || colors.info;

        toast.className = `${color.bg} ${color.border} ${color.text} border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out opacity-0 translate-x-full`;
        toast.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 text-xl font-bold">${color.icon}</div>
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button onclick="this.closest('[id^=toast-]').remove()" class="flex-shrink-0 text-lg hover:opacity-70 transition-opacity">
                    ×
                </button>
            </div>
        `;

        this.container.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-x-full');
            toast.classList.add('opacity-100', 'translate-x-0');
        }, 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    }

    remove(toast) {
        toast.classList.remove('opacity-100', 'translate-x-0');
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

// Initialize toast notification system
const toast = new ToastNotification();

// SweetAlert2 confirmation wrapper
async function confirmAction(options) {
    const defaultOptions = {
        title: 'Tem certeza?',
        text: 'Esta ação não pode ser desfeita!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, confirmar',
        cancelButtonText: 'Cancelar',
        ...options
    };

    return await Swal.fire(defaultOptions);
}

// Enhanced form submission with confirmation
function setupDeleteConfirmations() {
    document.querySelectorAll('form[action*="/delete"]').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const form = this;
            const action = form.getAttribute('action');
            const entity = action.match(/\/(\w+)\/\d+\/delete/)?.[1] || 'item';
            
            const entityNames = {
                projects: 'projeto',
                clients: 'cliente',
                admins: 'administrador',
                stages: 'etapa',
                activities: 'atividade'
            };

            const entityName = entityNames[entity] || 'item';

            const result = await confirmAction({
                title: 'Confirmar exclusão',
                text: `Tem certeza que deseja deletar este ${entityName}? Esta ação não pode ser desfeita.`,
                icon: 'warning',
                confirmButtonText: 'Sim, deletar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                form.submit();
            }
        });
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    setupDeleteConfirmations();
    
    // Show toast notifications from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const error = urlParams.get('error');
    const success = urlParams.get('success');
    
    if (message) {
        toast.info(message);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (error) {
        toast.error(error);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (success) {
        toast.success(success);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Export for global use
window.toast = toast;
window.confirmAction = confirmAction;

