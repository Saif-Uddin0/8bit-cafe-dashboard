import { Users, UserCheck, UserX } from "lucide-react";

const LeadsStatCards = ({ totalLeads = 0, activeLeads, inactiveLeads }) => {
  const stats = [
    {
      title: "Total Customers",
      value: totalLeads,
      icon: Users,
      bgColor: "bg-[#234EB71A]",
    },
    {
      title: "Active Members",
      value: activeLeads ?? "—",
      icon: UserCheck,
      bgColor: "bg-[#ECFDF5]",
    },
    {
      title: "Inactive Members",
      value: inactiveLeads ?? "—",
      icon: UserX,
      bgColor: "bg-[#FEF2F2]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className={`py-6 px-8 rounded-2xl flex flex-col justify-between h-[150px] shadow-sm border border-gray-100/50 ${stat.bgColor} transition-all duration-300 hover:scale-[1.01]`}
          >
            {/* Icon */}
            <div className="text-gray-700">
              <IconComponent size={24} strokeWidth={1.8} />
            </div>

            {/* Value & Label */}
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                {stat.value}
              </h3>
              <p className="text-[10px] md:text-xs font-bold text-[#64748B] tracking-wider mt-1 uppercase">
                {stat.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadsStatCards;
