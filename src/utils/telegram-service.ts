/**
 * Share a message via Telegram
 * @param message The message to share
 */
export const shareTelegramMessage = (message: string) => {
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Check if on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Use appropriate URL scheme
  if (isMobile) {
    // Mobile app deep link
    window.location.href = `tg://msg?text=${encodedMessage}`;
  } else {
    // Desktop web version
    window.open(`https://t.me/share/url?url=${encodedMessage}`, '_blank');
  }
};

/**
 * Create inventory report message for Telegram
 * @param departmentName Department name
 * @param date Date of inventory
 * @returns Formatted message
 */
export const createInventoryReportMessage = (departmentName: string, date: Date = new Date()) => {
  return `Інвентаризація: ${departmentName} (${date.toLocaleDateString()})\n\nПрикрепите скачанный файл Excel к этому сообщению.`;
};
