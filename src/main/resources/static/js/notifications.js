(function () {
    'use strict';

    function showToast(message) {
        var container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        var toast = document.createElement('div');
        toast.className = 'sse-toast';
        toast.textContent = message;
        container.appendChild(toast);

        // Trigger CSS transition after paint
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                toast.classList.add('sse-toast--visible');
            });
        });

        // Auto-dismiss after 5 seconds
        setTimeout(function () {
            toast.classList.remove('sse-toast--visible');
            setTimeout(function () {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 350);
        }, 5000);
    }

    // Expose for use by other scripts (e.g. application.js, Settings inline script)
    window.showToast = showToast;

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
