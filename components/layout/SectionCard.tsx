const SectionCard = ({ title, children }) => {
    return (
      <section className="bg-white shadow-md rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">{title}</h2>
        {children}
      </section>
    );
  };
  
  export default SectionCard;
  
