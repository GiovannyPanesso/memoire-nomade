// Formatea precio en euros
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// Formatea fecha: "2026-06-15" → "15 de junio de 2026"
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Formatea hora: "18:00:00" → "18:00 (hora francesa)"
export const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(":");
  return `${hours}:${minutes} (hora francesa CET/CEST)`;
};

// Formatea fecha y hora juntas
export const formatDateTime = (dateStr: string, timeStr: string): string => {
  return `${formatDate(dateStr)} a las ${formatTime(timeStr)}`;
};

// Formatea código de confirmación
export const formatConfirmationCode = (code: string): string =>
  code.toUpperCase();
