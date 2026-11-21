import { useMemo } from "react";
import type { PositionItem } from "~/server/database/schema.server";

export default function PositionListItem({
  name,
  title,
  link,
  location,
  officeType,
  description,
  highlights,
  startDate,
  endDate,
}: PositionItem) {
  const location_label = useMemo(() => {
    if (location) {
      switch (officeType) {
        case "hybrid":
          return ` • ${location} (Hybrid)`;
        case "remote":
          return ` • ${location} (Remote)`;
        default:
          return ` • ${location}`;
      }
    }
    return null;
  }, [location, officeType]);

  return (
    <li className="flex flex-col gap-2">
      <h4 className="font-semibold text-xl flex items-baseline flex-wrap">
        <span>{title}&nbsp;</span>
        <span className="text-base opacity-80 font-normal">@&nbsp;</span>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-base opacity-80 font-normal underline"
          >
            {name}
          </a>
        ) : (
          <span className="text-base opacity-80 font-normal">{name}</span>
        )}
      </h4>
      <p className="opacity-80">
        <span>
          {startDate} - {endDate ? endDate : "Current"}
        </span>
        {location_label && <span>{location_label}</span>}
      </p>
      {description && <p>{description}</p>}
      {highlights.length > 0 && (
        <ul className="list-disc list-inside">
          {highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      )}
    </li>
  );
}
