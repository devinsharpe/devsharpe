import { useMemo } from "react";
import { EmploymentPosition } from "~/types/about.types";

export default function PositionListItem({
  id,
  name,
  title,
  link,
  team,
  location,
  office_type,
  description,
  highlights,
  technologies,
  dates,
  type,
}: EmploymentPosition) {
  const location_label = useMemo(() => {
    if (location) {
      switch (office_type) {
        case "hybrid":
          return ` • ${location} (Hybrid)`;
        case "remote":
          return ` • ${location} (Remote)`;
        default:
          return ` • ${location}`;
      }
    }
    return null;
  }, [location]);

  return (
    <li className="flex flex-col gap-2">
      <h4 className="font-semibold text-xl flex items-baseline flex-wrap">
        <span>{title}&nbsp;</span>
        <span className="text-base opacity-80 font-normal">@&nbsp;</span>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-base opacity-80 font-normal underline"
        >
          {name}
        </a>
      </h4>
      <p className="opacity-80">
        <span>
          {dates.start} - {dates.end ? dates.end : "Current"}
        </span>
        {location_label && <span>{location_label}</span>}
      </p>
      <p>{description} </p>
      <ul className="list-disc list-inside">
        {highlights.map((highlight) => (
          <li>{highlight}</li>
        ))}
      </ul>
    </li>
  );
}
