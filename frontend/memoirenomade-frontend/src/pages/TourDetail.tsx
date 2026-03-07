import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Users,
  Check,
  X,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { tourService } from "@/services/tourService";
import { sessionService } from "@/services/sessionService";
import { TourDetail as TourDetailType } from "@/types/tour.types";
import { Session, SessionPricing } from "@/types/session.types";
import { useCartStore } from "@/store/useCartStore";
import { formatDate, formatTime, formatPrice } from "@/utils/formatters";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1280";

export default function TourDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, hasSession } = useCartStore();

  const [tour, setTour] = useState<TourDetailType | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Estado del selector de sesión
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<SessionPricing | null>(
    null,
  );
  const [numAdults, setNumAdults] = useState(0);
  const [numChildren, setNumChildren] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tourId = parseInt(id!);
        const [tourData, sessionsData] = await Promise.all([
          tourService.getTourById(tourId),
          sessionService.getSessionsByTour(tourId),
        ]);
        setTour(tourData);
        setSessions(sessionsData);
        setSelectedImage(tourData.mainImageUrl);
      } catch {
        navigate("/tours");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Calcular subtotal en tiempo real
  const calculateSubtotal = (): number => {
    if (!selectedPricing) return 0;
    let total = selectedPricing.price;

    // Buscar tarifa infantil si hay niños
    if (numChildren > 0 && selectedSession) {
      const childPricing = selectedSession.pricings.find(
        (p) => p.type === "child",
      );
      if (childPricing) total += childPricing.price * numChildren;
    }

    return total;
  };

  const handleAddToCart = () => {
    if (!selectedSession || !selectedPricing || !tour) return;
    if (numAdults === 0 && numChildren === 0) return;

    const childPricing = selectedSession.pricings.find(
      (p) => p.type === "child",
    );

    addItem({
      sessionId: selectedSession.id,
      sessionPricingId: selectedPricing.id,
      tourName: tour.name,
      tourImageUrl: tour.mainImageUrl,
      sessionDate: selectedSession.date,
      sessionTime: selectedSession.time,
      includesSeineCruise: selectedSession.includesSeineCruise,
      pricingLabel: selectedPricing.label,
      pricingPrice: selectedPricing.price,
      numAdults,
      numChildren,
      childPricePerChild: childPricing?.price ?? 0,
      subtotal: calculateSubtotal(),
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent" />
      </div>
    );
  }

  if (!tour) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Botón volver */}
      <div className="container-app pt-8">
        <button
          onClick={() => navigate("/tours")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a2e] transition-colors mb-6"
        >
          <ChevronLeft size={20} />
          Volver a tours
        </button>
      </div>

      <div className="container-app pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ── Columna izquierda: imágenes ─────────────────────── */}
          <div>
            {/* Imagen principal */}
            <div className="rounded-2xl overflow-hidden h-80 md:h-96 mb-4">
              <img
                src={selectedImage || tour.mainImageUrl || FALLBACK_IMAGE}
                alt={tour.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Galería */}
            {tour.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {/* Imagen principal como miniatura */}
                <button
                  onClick={() => setSelectedImage(tour.mainImageUrl)}
                  className={`rounded-lg overflow-hidden h-20 border-2 transition-all ${
                    selectedImage === tour.mainImageUrl
                      ? "border-yellow-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={tour.mainImageUrl || FALLBACK_IMAGE}
                    alt="Principal"
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Imágenes de galería */}
                {tour.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`rounded-lg overflow-hidden h-20 border-2 transition-all ${
                      selectedImage === img.imageUrl
                        ? "border-yellow-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Qué incluye / no incluye */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {tour.includes && (
                <div>
                  <h3 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
                    <Check size={18} className="text-green-500" />
                    Incluye
                  </h3>
                  <ul className="space-y-2">
                    {tour.includes.split(",").map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <Check
                          size={14}
                          className="text-green-500 mt-0.5 shrink-0"
                        />
                        {item.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tour.notIncludes && (
                <div>
                  <h3 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
                    <X size={18} className="text-red-400" />
                    No incluye
                  </h3>
                  <ul className="space-y-2">
                    {tour.notIncludes.split(",").map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <X size={14} className="text-red-400 mt-0.5 shrink-0" />
                        {item.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ── Columna derecha: info + selector ───────────────── */}
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1a1a2e] mb-4">
              {tour.name}
            </h1>
            <p className="text-gray-600 leading-relaxed mb-8">
              {tour.description}
            </p>

            {/* Sesiones disponibles */}
            {sessions.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <Clock size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No hay sesiones disponibles en este momento.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1a1a2e] mb-4">
                  Selecciona una sesión
                </h2>

                {/* Lista de sesiones */}
                <div className="space-y-3 mb-6">
                  {sessions.map((session) => {
                    const isSelected = selectedSession?.id === session.id;
                    const isInCart = hasSession(session.id);

                    return (
                      <button
                        key={session.id}
                        onClick={() => {
                          if (!isInCart) {
                            setSelectedSession(session);
                            setSelectedPricing(null);
                            setNumAdults(0);
                            setNumChildren(0);
                          }
                        }}
                        disabled={isInCart}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isInCart
                            ? "border-green-300 bg-green-50 cursor-not-allowed"
                            : isSelected
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-gray-200 hover:border-yellow-300 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-[#1a1a2e]">
                              {formatDate(session.date)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatTime(session.time)}
                            </p>
                            {session.includesSeineCruise && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                                Incluye crucero por el Sena
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Users size={14} />
                              {session.availableSpots} plazas
                            </span>
                            {isInCart && (
                              <span className="text-xs text-green-600 font-semibold">
                                ✓ En el carrito
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selector de composición */}
                {selectedSession && (
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold text-[#1a1a2e]">
                      Composición del grupo
                    </h3>

                    {/* Selector de tarifa de grupo */}
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Tarifa de adultos
                      </label>
                      <div className="space-y-2">
                        {selectedSession.pricings
                          .filter(
                            (p) => p.type === "group" || p.type === "extra",
                          )
                          .map((pricing) => (
                            <button
                              key={pricing.id}
                              onClick={() => setSelectedPricing(pricing)}
                              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                                selectedPricing?.id === pricing.id
                                  ? "border-yellow-500 bg-yellow-50"
                                  : "border-gray-200 bg-white hover:border-yellow-300"
                              }`}
                            >
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-[#1a1a2e]">
                                  {pricing.label}
                                </span>
                                <span className="text-sm font-bold text-yellow-600">
                                  {formatPrice(pricing.price)}
                                </span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Selector de niños */}
                    {selectedSession.pricings.some(
                      (p) => p.type === "child",
                    ) && (
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">
                          Niños (
                          {formatPrice(
                            selectedSession.pricings.find(
                              (p) => p.type === "child",
                            )?.price ?? 0,
                          )}{" "}
                          por niño)
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              setNumChildren(Math.max(0, numChildren - 1))
                            }
                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-yellow-500 transition-colors"
                          >
                            −
                          </button>
                          <span className="text-lg font-semibold w-6 text-center">
                            {numChildren}
                          </span>
                          <button
                            onClick={() => setNumChildren(numChildren + 1)}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-yellow-500 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Subtotal */}
                    {selectedPricing && (
                      <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                        <span className="font-semibold text-[#1a1a2e]">
                          Subtotal
                        </span>
                        <span className="text-2xl font-bold text-yellow-600">
                          {formatPrice(calculateSubtotal())}
                        </span>
                      </div>
                    )}

                    {/* Botón añadir al carrito */}
                    <button
                      onClick={handleAddToCart}
                      disabled={
                        !selectedPricing ||
                        (numAdults === 0 && numChildren === 0)
                      }
                      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                        addedToCart
                          ? "bg-green-500 text-white"
                          : !selectedPricing ||
                              (numAdults === 0 && numChildren === 0)
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-yellow-500 hover:bg-yellow-400 text-[#1a1a2e] hover:scale-105"
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <Check size={20} />
                          ¡Añadido al carrito!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          Añadir al carrito
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
