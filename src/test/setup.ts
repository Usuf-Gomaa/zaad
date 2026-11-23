import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
if (!HTMLDialogElement.prototype.showModal)
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
