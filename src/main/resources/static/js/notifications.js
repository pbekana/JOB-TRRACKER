(function () {
    'use strict';

    /**
     * showToast(message, type)
     *
     * type: 'success' | 'error' | 'warning' | 'info' | undefined
     * - success: green, auto-dismiss 4s
     * - error:   red, stays until dismissed (has × button)
     * - warning: orange, auto-dismiss 4s
     * - info:    blue, auto-dismiss 4s
     * - (none):  dark, auto-dismiss 5s  (backwards-compat)
     */
    function showToast(message, type) {
        var container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        var toast = document.createElement('div');
        toast.className = 'sse-toast';

        if (type) {
            toast.classList.add('sse-toast--' + type);
        }

        // For error/warning, allow pointer events so dismiss button works
        if (type === 'error' || type === 'warning') {
            toast.style.pointerEvents = 'auto';
        }

        var textSpan = document.createElement('span');
        textSpan.textContent = message;
        toast.appendChild(textSpan);

        // Dismiss button for error toasts (or any type)
        var dismissBtn = document.createElement('button');
        dismissBtn.textContent = '×';
        dismissBtn.className = 'sse-toast-dismiss';
        dismissBtn.setAttribute('aria-label', 'Dismiss notification');
        dismissBtn.addEventListener('click', function () {
            removeToast(toast);
        });
        toast.appendChild(dismissBtn);

        container.appendChild(toast);

        // Trigger CSS transition after paint
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                toast.classList.add('sse-toast--visible');
            });
        });

        // Auto-dismiss timing
        var autoDismissMs = null;
        if (!type) {
            autoDismissMs = 5000; // backwards-compat default
        } else if (type === 'success' || type === 'info') {
            autoDismissMs = 4000;
        } else if (type === 'warning') {
            autoDismissMs = 5000;
        }
        // type === 'error': no auto-dismiss

        if (autoDismissMs !== null) {
            setTimeout(function () {
                removeToast(toast);
            }, autoDismissMs);
        }
    }

    function removeToast(toast) {
        toast.classList.remove('sse-toast--visible');
        setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 350);
    }

    /**
     * showConfirm(message, onConfirm, onCancel)
     * Shows a centered modal with Confirm / Cancel buttons.
     * ESC key treated as cancel.
     */
    function showConfirm(message, onConfirm, onCancel) {
        var overlay = createOverlay();
        var modal = createModalBox();

        var p = document.createElement('p');
        p.textContent = message;
        modal.appendChild(p);

        var actions = document.createElement('div');
        actions.className = 'jt-modal-actions';

        var cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'jt-btn-cancel';
        cancelBtn.addEventListener('click', function () {
            closeModal(overlay);
            if (typeof onCancel === 'function') onCancel();
        });

        var confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirm';
        confirmBtn.className = 'jt-btn-confirm';
        confirmBtn.addEventListener('click', function () {
            closeModal(overlay);
            if (typeof onConfirm === 'function') onConfirm();
        });

        actions.appendChild(cancelBtn);
        actions.appendChild(confirmBtn);
        modal.appendChild(actions);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // ESC to cancel
        var escHandler = function (e) {
            if (e.key === 'Escape') {
                closeModal(overlay);
                document.removeEventListener('keydown', escHandler);
                if (typeof onCancel === 'function') onCancel();
            }
        };
        document.addEventListener('keydown', escHandler);

        // Trap focus
        confirmBtn.focus();
    }

    /**
     * showPromptModal(fields, onSubmit, onCancel)
     *
     * fields: Array of { label, placeholder, required, type }
     * onSubmit(valuesArray): called with an array of string values matching field order
     * onCancel: optional callback
     */
    function showPromptModal(fields, onSubmit, onCancel) {
        var overlay = createOverlay();
        var modal = createModalBox();

        var inputs = [];

        fields.forEach(function (field) {
            var fieldDiv = document.createElement('div');
            fieldDiv.className = 'jt-modal-field';

            var label = document.createElement('label');
            label.textContent = field.label || '';
            fieldDiv.appendChild(label);

            var input = document.createElement('input');
            input.type = field.type || 'text';
            input.placeholder = field.placeholder || '';
            if (field.required) input.required = true;
            fieldDiv.appendChild(input);

            modal.appendChild(fieldDiv);
            inputs.push(input);
        });

        var actions = document.createElement('div');
        actions.className = 'jt-modal-actions';

        var cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'jt-btn-cancel';
        cancelBtn.type = 'button';
        cancelBtn.addEventListener('click', function () {
            closeModal(overlay);
            if (typeof onCancel === 'function') onCancel();
        });

        var okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.className = 'jt-btn-confirm';
        okBtn.type = 'button';
        okBtn.addEventListener('click', function () {
            // Validate required fields
            var valid = true;
            inputs.forEach(function (inp, i) {
                if (fields[i] && fields[i].required && !inp.value.trim()) {
                    inp.style.borderColor = '#ef4444';
                    valid = false;
                } else {
                    inp.style.borderColor = '';
                }
            });
            if (!valid) return;

            var values = inputs.map(function (inp) { return inp.value; });
            closeModal(overlay);
            if (typeof onSubmit === 'function') onSubmit(values);
        });

        actions.appendChild(cancelBtn);
        actions.appendChild(okBtn);
        modal.appendChild(actions);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Auto-focus first input
        if (inputs.length > 0) {
            inputs[0].focus();
        }

        // ESC to cancel
        var escHandler = function (e) {
            if (e.key === 'Escape') {
                closeModal(overlay);
                document.removeEventListener('keydown', escHandler);
                if (typeof onCancel === 'function') onCancel();
            }
        };
        document.addEventListener('keydown', escHandler);

        // Submit on Enter in last field
        if (inputs.length > 0) {
            inputs[inputs.length - 1].addEventListener('keydown', function (e) {
                if (e.key === 'Enter') okBtn.click();
            });
        }
    }

    // ---- helpers ----

    function createOverlay() {
        var overlay = document.createElement('div');
        overlay.className = 'jt-overlay';
        return overlay;
    }

    function createModalBox() {
        var modal = document.createElement('div');
        modal.className = 'jt-modal';
        return modal;
    }

    function closeModal(overlay) {
        overlay.style.opacity = '0';
        setTimeout(function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);
    }

    // Expose on window
    window.showToast = showToast;
    window.showConfirm = showConfirm;
    window.showPromptModal = showPromptModal;

    // Connect to SSE stream if the browser supports it
    if (typeof EventSource !== 'undefined') {
        var source = new EventSource('/api/notifications/stream');

        source.addEventListener('new-job', function (event) {
            showToast('🆕 New job added: ' + event.data);
        });

        // Silently ignore errors — browser will auto-reconnect
        source.onerror = function () {};
    }
}());
