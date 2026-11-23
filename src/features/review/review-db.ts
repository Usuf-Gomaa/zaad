import Dexie, { type Table } from "dexie";
import { saves } from "../../db";
import { writesFrozen } from "../../pwa/write-barrier";
export type FeedbackSnapshot = {
  sourcePackSha256?: string;
  note: string;
  updatedAt: number;
  edition?: string;
  decision?: "agree" | "revise" | "research";
  reviewerName?: string;
};
export type Feedback = FeedbackSnapshot & {
  id: string;
  history?: FeedbackSnapshot[];
};
// Isolated development-only editorial feedback. Never changes pilgrim data or approvals.
class EditorialDB extends Dexie {
  feedback!: Table<Feedback>;
  constructor() {
    super("zaad-editorial");
    this.version(1).stores({ feedback: "id" });
  }
}
export const editorialDb = new EditorialDB();
// Sharing the commit queue makes route/language changes and safe PWA updates wait for review notes too.
export const feedbackSaves = saves;
export function saveFeedback(feedback: Feedback) {
  return feedbackSaves.enqueue(() => {
    if (writesFrozen()) throw Error("update.locked");
    return editorialDb.transaction("rw", editorialDb.feedback, async () => {
      const previous = await editorialDb.feedback.get(feedback.id);
      let history = previous?.history || [];
      if (
        previous &&
        feedback.edition &&
        (previous.edition !== feedback.edition ||
          previous.sourcePackSha256 !== feedback.sourcePackSha256)
      ) {
        const { id, history: oldHistory, ...snapshot } = previous;
        history = [...history, snapshot];
      }
      return editorialDb.feedback.put({
        ...previous,
        ...feedback,
        ...(history.length ? { history } : {}),
      });
    });
  });
}
