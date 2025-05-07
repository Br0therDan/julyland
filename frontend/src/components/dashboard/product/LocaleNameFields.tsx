import DynamicFieldArray, { FieldConfig } from '@/components/common/forms/DynamicFieldArray';


const localeFields: FieldConfig[] = [
  {
    name: "locale",
    type: "select",
    placeholder: "언어",
    options: [
      { value: "ko", label: "한국어" },
      { value: "ja", label: "일본어" },
      { value: "zh", label: "중국어" },
    ],
    className: "w-24",
  },
  {
    name: "name",
    type: "input",
    placeholder: "이름 입력",
    className: "flex-1",
  },
];

export default function LocaleNameFields() {
  return (
    <DynamicFieldArray
      name="locale_names"
      label="제품 이름 (다국어)"
      defaultItem={{ locale: "ko", name: "" }}
      fields={localeFields}
      addButtonLabel="다국어 이름 추가"
    />
  );
}
