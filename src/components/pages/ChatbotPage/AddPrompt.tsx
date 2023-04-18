import React, { useMemo, useState } from "react";
import { clone, findIndex, map } from "lodash";
import { useForm } from "@mantine/form";
import {
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  Modal,
  NativeSelect,
  NumberInput,
  ScrollArea,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import classNames from "classnames";
import useStyles from "@/components/pages/ChatbotPage/Message.style";

export type PromptSaveData = {
  name: string;
  temperature: number;
  wrapSingleLine: boolean;
  prompts: any[];
  id?: any;
};

const AddPrompt = ({
  opened,
  close,
  loading,
  onSave,
  editData,
}: {
  opened: boolean;
  close: () => void;
  loading: boolean;
  onSave: (data: PromptSaveData) => any;
  editData?: PromptSaveData;
}) => {
  const { classes } = useStyles();
  const defaultValue: any = {
    role: "system",
    prompt: "",
  };
  const [prompts, setPrompts] = useState<
    Array<
      | {
          role: "user" | "assistant" | "system";
          prompt: string;
        }
      | "your"
    >
  >(editData?.prompts || [clone(defaultValue), "your"]);
  const yourIndex = useMemo(() => {
    return findIndex(prompts, v => v === "your");
  }, [prompts]);
  const addForm = useForm({
    initialValues: {
      name: editData?.name || "",
      temperature: editData && editData.temperature >= 0 ? editData?.temperature : 0.7,
      wrapSingleLine: false,
    },
    validate: {
      name: v => (["", null, undefined].includes(v) ? "Invalid field" : null),
      temperature: v => (+v < 0 || +v > 2 ? "Invalid field" : null),
    },
  });

  const addPromptSetup = (posIndex: number) => {
    prompts.splice(posIndex, 0, { ...defaultValue, role: posIndex === 0 ? "system" : "user" });
    setPrompts(clone(prompts));
  };
  const removePromptSetup = (index: number) => {
    prompts.splice(index, 1);
    setPrompts(clone(prompts));
  };

  return (
    <Modal
      size="lg"
      centered={true}
      opened={opened}
      onClose={close}
      title="Add prompt template"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <div>
        <div>
          <TextInput label={"Name"} required placeholder={"your template name..."} {...addForm.getInputProps("name")} />
          <NumberInput
            label={"Temperature"}
            required
            placeholder={"0.0-2.0 (0.0-Precise, 0.5-Balanced, 1.0-Creative)"}
            precision={1}
            min={0.0}
            step={0.1}
            max={2.0}
            {...addForm.getInputProps("temperature")}
            className="mt-1"
          />
          <Checkbox
            label="Wrap user's chat content with quotation marks if the content is only one line."
            {...addForm.getInputProps("wrapSingleLine", {
              type: "checkbox",
            })}
            className="mt-3"
          />
          {yourIndex === 0 && (
            <Divider
              variant="dashed"
              labelPosition="center"
              label={
                <Button leftIcon={<IconPlus />} size="xs" variant="default" onClick={() => addPromptSetup(0)}>
                  Add here
                </Button>
              }
            />
          )}
          {map(prompts, (prompt, i) => {
            if (prompt === "your") {
              return (
                <div className="pt-3">
                  <Card p="xs" withBorder className="flex flex-row items-center gap-3" bg="green">
                    <Button compact variant="light">
                      {i + 1}
                    </Button>
                    <div>
                      <Chip checked={true} radius="sm">
                        Your input prompt is here
                      </Chip>
                    </div>
                  </Card>
                </div>
              );
            }

            return (
              <>
                {(i - 1 === yourIndex || i === 0) && (
                  <Divider
                    key={"divider0" + i}
                    variant="dashed"
                    labelPosition="center"
                    className="my-3"
                    label={
                      <Button leftIcon={<IconPlus />} size="xs" variant="default" onClick={() => addPromptSetup(i)}>
                        Add here
                      </Button>
                    }
                  />
                )}
                <Card withBorder p="xs" className="flex flex-row items-center gap-3 mt-3">
                  <Button compact variant="light">
                    {i + 1}
                  </Button>
                  <div className="flex flex-col flex-grow" key={i}>
                    <NativeSelect
                      label="Role"
                      data={[
                        { value: "system", label: "System" },
                        { value: "user", label: "User" },
                        { value: "assistant", label: "Assistant" },
                      ]}
                      value={prompt.role}
                      onChange={e => {
                        (prompts[i] as any).role = e.target.value as any;
                        setPrompts(clone(prompts));
                      }}
                      w={120}
                    />
                    <Textarea
                      label="Prompt"
                      placeholder="Prompt content..."
                      onChange={e => {
                        (prompts[i] as any).prompt = e.target.value;
                        setPrompts(clone(prompts));
                      }}
                      value={prompt.prompt}
                      autosize={true}
                    />
                  </div>
                  <div className="h-full flex items-center gap-2">
                    <Divider
                      orientation="vertical"
                      variant="dashed"
                      style={{
                        minHeight: 80,
                      }}
                    />
                    <Button compact variant="light" color="red" onClick={() => removePromptSetup(i)}>
                      <IconTrash size="1rem" stroke={1.5} />
                    </Button>
                  </div>
                </Card>
                <Divider
                  key={"divider" + i}
                  variant="dashed"
                  labelPosition="center"
                  className="mt-3"
                  label={
                    <Button leftIcon={<IconPlus />} size="xs" variant="default" onClick={() => addPromptSetup(i + 1)}>
                      Add here
                    </Button>
                  }
                />
              </>
            );
          })}
          {prompts.length - 1 === yourIndex && (
            <Divider
              variant="dashed"
              labelPosition="center"
              className="mt-3"
              label={
                <Button
                  leftIcon={<IconPlus />}
                  size="xs"
                  variant="default"
                  onClick={() => addPromptSetup(prompts.length)}
                >
                  Add here
                </Button>
              }
            />
          )}
          <div className="h-20" />
        </div>
        <div className={classNames("absolute bottom-0 right-0 w-full bg-bottom px-4 py-2", classes.bgAction)}>
          <div className="flex items-center justify-end gap-3">
            {editData && (
              <Button
                loading={loading}
                onClick={() => {
                  if (!addForm.validate().hasErrors) {
                    onSave({
                      name: addForm.values.name,
                      temperature: +addForm.values.temperature,
                      wrapSingleLine: Boolean(addForm.values.wrapSingleLine),
                      prompts: prompts.filter(v => {
                        if (typeof v === "string") return true;
                        return v.prompt.trim().length > 0;
                      }),
                    });
                  }
                }}
                variant="light"
              >
                Clone
              </Button>
            )}
            <Button
              loading={loading}
              onClick={() => {
                if (!addForm.validate().hasErrors) {
                  onSave({
                    name: addForm.values.name,
                    temperature: +addForm.values.temperature,
                    wrapSingleLine: Boolean(addForm.values.wrapSingleLine),
                    prompts: prompts.filter(v => {
                      if (typeof v === "string") return true;
                      return v.prompt.trim().length > 0;
                    }),
                    id: editData?.id,
                  });
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddPrompt;
