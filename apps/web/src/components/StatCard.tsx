type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  className: string;
  descriptionClassName?: string;
};

function StatCard({
  title,
  value,
  description,
  className,
  descriptionClassName = "text-[#6B7280]"
}: StatCardProps) {
  return (
    <div className={`rounded-[28px] p-6 ${className}`}>
      <p className="text-sm font-semibold text-[#4B5563]">{title}</p>

      <h3 className="mt-4 text-[38px] font-extrabold tracking-[-0.04em]">
        {value}
      </h3>

      <p className={`mt-3 text-sm font-medium ${descriptionClassName}`}>
        {description}
      </p>
    </div>
  );
}

export default StatCard;