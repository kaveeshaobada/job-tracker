import { useState } from "react";
import { Building2 } from "lucide-react";

function CompanyLogo({ company, size = 36 }) {
  const [failed, setFailed] = useState(false);
  const domain = company.trim().toLowerCase().replace(/\s+/g, "") + ".com";

  if (failed) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"
      >
        <Building2 size={size * 0.5} className="text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={`${company} logo`}
      style={{ width: size, height: size }}
      className="rounded-lg object-contain bg-white flex-shrink-0"
      onError={() => setFailed(true)}
    />
  );
}

export default CompanyLogo;