import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { bitable, FieldType, ITextField } from '@lark-base-open/js-sdk'; 
import { Select, Button } from 'antd';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LoadApp />
  </React.StrictMode>
);

function LoadApp() {
  const [currencyFieldMetaList, setMetaList] = useState<ITextField[]>([]) 
  const [selectFieldId, setSelectFieldId] = useState<string>(); 
  const [currency, setCurrency] = useState();
  const [result, setResult] = useState<number | null>(null); // 存储计算结果

  useEffect(() => {
    const fn = async () => {
      const table = await bitable.base.getActiveTable();
      console.log(table);
      const fieldMetaList = await table.getFieldMetaListByType<ITextField>(FieldType.Text); 
      console.log(fieldMetaList);
      setMetaList(fieldMetaList); 
    };
    fn();
  }, []);

  const formatFieldMetaList = (metaList: ITextField[]) => {
    return metaList.map((meta) => ({ label: meta.name, value: meta.id }));
  };

  const transform = async () => {
    if (!selectFieldId ) return;
    console.log('不为空',selectFieldId);
    const table = await bitable.base.getActiveTable();
    // 在使用 ts 的情况下，我们限制了这个字段的类型之后 
    // 在开发时就会获得很多类型提示，来帮我们进行开发  
    const currencyField = await table.getField<ITextField>(selectFieldId); 
    console.log(currencyField);
    // 首先我们获取 recordId 
    const recordIdList = await table.getRecordIdList();
    console.log(recordIdList);

    let calculatedResult = 1;
    
    // 对 record 进行遍历
    for (const recordId of recordIdList) {
      const currentVal = await currencyField.getValue(recordId);
      const goodRate = currentVal[0].text/100;
      console.log(goodRate);
      calculatedResult *= goodRate;
    }

    // 保留3位小数
    const formattedResult = calculatedResult.toFixed(3);

    // 存储计算结果
    setResult(parseFloat(formattedResult));
    
    console.log('最后的结果：',result);
  }

  return (
    <div>
      <div style={{ margin: 20 }}>
        <div>良率记录列</div>
        <Select
          style={{ width: 140 }}
          onSelect={setSelectFieldId}
          options={formatFieldMetaList(currencyFieldMetaList)}
        />
      </div>
      <Button style={{ marginLeft: 20 }} onClick={transform}>计算</Button>
      {result !== null && (
        <div style={{ marginTop: 20, marginLeft: 20 }}>
          良率: {result}
        </div>
      )}
    </div>
  );
}