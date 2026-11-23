import {
  reviewFaqs,
  reviewRecords,
  reviewSources,
} from "../../content/review-v2/records";
import { FaqPage } from "../faq/FaqPage";
import { ReviewShell } from "./ReviewShell";
import { ReviewRecordPanel } from "./ReviewRecordPanel";
import { ReviewExports } from "./ReviewExports";
export default function ReviewFaqPage() {
  return (
    <ReviewShell>
      <ReviewExports records={reviewRecords} />
      <FaqPage
        records={reviewFaqs}
        registry={reviewSources}
        editorial
        editorialConsent
        renderEditorialTools={(record) => (
          <ReviewRecordPanel key={record.id} record={record} />
        )}
      />
    </ReviewShell>
  );
}
