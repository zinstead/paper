import { operators } from "@/constant";
import type { SearchRule } from "@/type";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
} from "@arco-design/web-react";
import useForm from "@arco-design/web-react/es/Form/useForm";
import { IconDelete, IconPlus } from "@arco-design/web-react/icon";

const AdvancedSearchModal = (props: {
  visible: boolean;
  onCancel: () => void;
  onSearch: (searchRules: SearchRule[]) => void;
  searchProperties: string[];
}) => {
  const { visible, onCancel, onSearch, searchProperties } = props;
  const [form] = useForm();

  const onConfirm = () => {
    const searchRules = form.getFieldValue("searchRules");
    onSearch(searchRules);
    onCancel();
  };

  return (
    <Modal
      title={"高级检索"}
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      simple
      style={{ width: 800 }}
    >
      <Form form={form}>
        <Form.List field="searchRules">
          {(fields, { add, remove }) => (
            <div>
              <Form.Item labelAlign="left" colon>
                <Button
                  onClick={() => {
                    add();
                  }}
                  type="primary"
                  icon={<IconPlus />}
                  style={{ width: 100 }}
                >
                  Rule
                </Button>
              </Form.Item>
              {fields.map((field, index) => (
                <Space key={field.key}>
                  <Form.Item field={`${field.field}.property`}>
                    <Select
                      style={{ width: 200 }}
                      placeholder="属性"
                      options={searchProperties}
                    ></Select>
                  </Form.Item>
                  <Form.Item field={`${field.field}.operator`}>
                    <Select
                      style={{ width: 200 }}
                      placeholder="操作符"
                      options={operators}
                    ></Select>
                  </Form.Item>
                  <Form.Item field={`${field.field}.value`}>
                    <Input style={{ width: 200 }} placeholder="值"></Input>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      onClick={() => {
                        remove(index);
                      }}
                      status="danger"
                      shape="circle"
                      icon={<IconDelete />}
                    ></Button>
                  </Form.Item>
                </Space>
              ))}
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default AdvancedSearchModal;
