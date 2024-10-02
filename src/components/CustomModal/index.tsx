"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface Props {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  style?: React.CSSProperties;
}

const CustomModal: React.FC<Props> = ({
  title,
  content,
  isOpen,
  onClose,
  style,
}) => {
  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={onClose}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      style={style}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>
          <div>{content}</div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          {/* <Button color="primary" onPress={onClose}>
            Action
          </Button> */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;
