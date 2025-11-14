import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

export const FeedbackModal = ({
  isOpen,
  onClose,
  feedback,
  setFeedback,
  onSubmit,
  translations,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{translations.provideFeedback}</DialogTitle>
          <p className="text-sm text-gray-500">
            {translations.feedbackDescription}
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={translations.feedbackPlaceholder}
            className="w-full min-h-[100px] p-3 rounded-md border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {translations.cancel}
          </Button>
          <Button onClick={onSubmit} disabled={!feedback.trim()}>
            {translations.feedbackSubmit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

FeedbackModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  feedback: PropTypes.string.isRequired,
  setFeedback: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
};
