// Notification utility helper for web push notifications

// Request notification permission
export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

// Show notification for new message
export const showMessageNotification = (senderName, messageText, onClick) => {
    if (Notification.permission !== "granted") {
        return;
    }

    // Only show if tab is not focused
    if (document.hasFocus()) {
        return;
    }

    const notification = new Notification(`💬 ${senderName}`, {
        body: messageText,
        icon: "/logo192.png", // Use your app icon
        badge: "/logo192.png",
        tag: "message-notification",
        renotify: true,
        requireInteraction: false,
        silent: false,
    });

    notification.onclick = () => {
        window.focus();
        if (onClick) onClick();
        notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
        notification.close();
    }, 5000);

    return notification;
};

// Play notification sound
export const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch((err) => {
        console.log("Could not play notification sound:", err);
    });
};
