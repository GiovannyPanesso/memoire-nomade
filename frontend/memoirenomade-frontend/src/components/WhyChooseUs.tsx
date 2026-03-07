import { Map, Users, Lock, Star } from "lucide-react";

const features = [
  {
    icon: <Map size={32} className="text-yellow-500" />,
    title: "Guías nativos de habla hispana",
    description:
      "Nuestros guías son parisinos de nacimiento que hablan español con fluidez. Conocen cada rincón de la ciudad.",
  },
  {
    icon: <Users size={32} className="text-yellow-500" />,
    title: "Grupos reducidos y personalizados",
    description:
      "Máximo 8 personas por tour para garantizar una experiencia íntima, cercana y sin aglomeraciones.",
  },
  {
    icon: <Lock size={32} className="text-yellow-500" />,
    title: "Reserva 100% segura",
    description:
      "Pago seguro con Stripe y PayPal. Tus datos están siempre protegidos con cifrado de extremo a extremo.",
  },
  {
    icon: <Star size={32} className="text-yellow-500" />,
    title: "Experiencia única en París",
    description:
      "Descubrimos los rincones que los turistas no conocen. Una memoria que llevarás contigo para siempre.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-app">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1a1a2e] mb-4">
            ¿Por qué elegirnos?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Más de cinco años creando experiencias memorables en París para
            viajeros de habla hispana.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-[#1a1a2e] font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
