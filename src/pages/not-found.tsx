import { FiCompass } from "react-icons/fi";
import EmptyState from "../components/empty-state";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const NotFound = () => {
  useDocumentTitle("Page not found");
  return (
    <div className="page">
      <EmptyState
        icon={<FiCompass />}
        title="We couldn't find that page"
        text="The link may be broken or the page may have moved."
        action={{ label: "Back to the store", to: "/" }}
      />
    </div>
  );
};

export default NotFound;
