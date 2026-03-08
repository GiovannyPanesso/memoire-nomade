import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import api from "@/services/api";
import { formatDate } from "@/utils/formatters";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [filterRead, setFilterRead] = useState<string>("");

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await api.get("/admin/messages");
        setMessages(data);
      } catch {
        setActionError("No se pudieron cargar los mensajes.");
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const params = filterRead !== "" ? { isRead: filterRead === "true" } : {};
      const { data } = await api.get("/admin/messages", { params });
      setMessages(data);
    } catch {
      setActionError("No se pudieron cargar los mensajes.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await api.put(`/admin/messages/${id}/read`);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, isRead: true } : null));
      }
    } catch {
      setActionError("No se pudo marcar como leído.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este mensaje?")) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch {
      setActionError("No se pudo eliminar el mensaje.");
    }
  };

  const handleSelect = async (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      await handleMarkRead(message.id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1a1a2e]">
            Mensajes de Contacto
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {messages.length} mensajes
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} sin leer
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Error */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-red-600 text-sm">{actionError}</p>
          <button
            onClick={() => setActionError(null)}
            className="ml-auto text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-3">
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-yellow-400 outline-none text-sm"
        >
          <option value="">Todos los mensajes</option>
          <option value="false">Sin leer</option>
          <option value="true">Leídos</option>
        </select>

        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-semibold rounded-xl transition-all text-sm"
        >
          <RefreshCw size={14} />
          Filtrar
        </button>
      </div>

      {/* Layout lista + detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de mensajes */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {messages.length === 0 ? (
            <div className="p-12 text-center">
              <Mail size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No hay mensajes que mostrar.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleSelect(message)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedMessage?.id === message.id
                      ? "bg-yellow-50 border-l-4 border-yellow-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {message.isRead ? (
                        <MailOpen
                          size={16}
                          className="text-gray-400 shrink-0"
                        />
                      ) : (
                        <Mail size={16} className="text-yellow-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`text-sm truncate ${!message.isRead ? "font-bold text-[#1a1a2e]" : "font-medium text-gray-700"}`}
                        >
                          {message.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {message.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-gray-400">
                        {formatDate(message.createdAt.split("T")[0])}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(message.id);
                        }}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p
                    className={`text-xs mt-1 truncate pl-6 ${!message.isRead ? "text-gray-700 font-medium" : "text-gray-400"}`}
                  >
                    {message.subject}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalle del mensaje */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {selectedMessage ? (
            <div className="space-y-5">
              {/* Cabecera mensaje */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-serif font-bold text-[#1a1a2e] text-lg">
                    {selectedMessage.subject}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(selectedMessage.createdAt.split("T")[0])}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Info remitente */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-[#1a1a2e]">
                  {selectedMessage.name}
                </p>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="text-sm text-yellow-600 hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>

              {/* Mensaje */}
              <div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Botón responder */}
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                className="flex items-center justify-center gap-2 w-full bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] font-bold py-3 rounded-xl transition-all"
              >
                <Mail size={16} />
                Responder al cliente
              </a>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <MailOpen size={40} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">
                Selecciona un mensaje para ver su contenido.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
