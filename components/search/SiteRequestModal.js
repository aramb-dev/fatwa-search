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
import { Input } from "../ui/input";

export const SiteRequestModal = ({
  isOpen,
  onClose,
  siteInput,
  setSiteInput,
  onSubmit,
  translations,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{translations.requestNewSite}</DialogTitle>
          <p className="text-sm text-gray-500">
            {translations.enterSiteDomain}
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={siteInput}
            onChange={(e) => setSiteInput(e.target.value)}
            placeholder={translations.siteUrlPlaceholder}
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {translations.cancel}
          </Button>
          <Button onClick={onSubmit}>{translations.submitRequest}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

SiteRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  siteInput: PropTypes.string.isRequired,
  setSiteInput: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
};
