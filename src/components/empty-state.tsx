import { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  icon: ReactNode;
  title: string;
  text?: string;
  action?: { label: string; to: string };
};

const EmptyState = ({ icon, title, text, action }: Props) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h2>{title}</h2>
    {text && <p>{text}</p>}
    {action && (
      <Link to={action.to} className="btn btn-primary">
        {action.label}
      </Link>
    )}
  </div>
);

export default EmptyState;
