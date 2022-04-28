import React from "react";
import { Button, Divider, Modal, Spin, InputNumber, Statistic, text } from "antd";
import { useState, useEffect } from "react";
import { AddressInput } from "..";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
export default function CreateNewMultisig({ address, mainnetProvider, localProvider }) {
  const [visible, setVisible] = useState(false);
  const [owners, setOwners] = useState([""]);
  const [signaturesRequired, setsignaturesRequired] = useState();
  const showvisibility = () => {
    setVisible(true);
  };
  console.log(localProvider);
  console.log(localProvider && localProvider._network && localProvider._network.name);
  console.log(localProvider && localProvider._network);

  let networkName = "";
  if ((localProvider && localProvider._network && localProvider._network.name) === "homestead") {
    networkName = "mainnet";
  } else {
    networkName = localProvider && localProvider._network && localProvider._network.name;
  }
  useEffect(() => {
    if (address) {
      setOwners([address, ""]);
    }
  }, [address]);
  console.log(owners);

  const cancelvisibility = () => {
    setVisible(false);
  };

  const submitNewWallet = () => {
    console.log("submitNewWallet");
  };

  const updateOwner = (value, index) => {
    const newOwners = [...owners];
    newOwners[index] = value;
    setOwners(newOwners);
  };

  const removeOwnerField = index => {
    const newOwners = [...owners];
    newOwners.splice(index, 1);
    setOwners(newOwners);
  };

  const addOwnerField = () => {
    const newOwners = [...owners, ""];
    setOwners(newOwners);
  };
  console.log([...owners]);

  return (
    <div>
      <Button type="primary" style={{ marginRight: 10 }} onClick={showvisibility}>
        Create New Multisig
      </Button>

      <Modal
        title="Create New Multisig Wallet"
        visible={visible}
        onCancel={cancelvisibility}
        footer={[
          <Button key="cancel" onClick={cancelvisibility}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={submitNewWallet}>
            Create
          </Button>,
        ]}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {owners.map((owner, index) => (
            <div key={index} style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: "90%" }}>
                <AddressInput
                  autoFocus
                  ensProvider={mainnetProvider}
                  placeholder="Owner Address"
                  value={owner}
                  onChange={val => updateOwner(val, index)}
                />
              </div>
              {index != 0 && (
                <Button style={{ padding: "0 0.5rem" }} onClick={() => removeOwnerField(index)} danger>
                  <DeleteOutlined />
                </Button>
              )}
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", width: "90" }}>
            <Button onClick={addOwnerField}>
              <PlusOutlined />
            </Button>
          </div>
          <div style={{ width: "90%" }}>
            <InputNumber
              style={{ width: "50%" }}
              placeholder="No Of Signatures Required"
              value={signaturesRequired}
              onChange={val => setsignaturesRequired(val)}
            />
          </div>
          <div style={{ width: "90%" }}>
            <text style={{ fontSize: "large" }}>
              You are deploying to <b>{networkName}</b>
            </text>
          </div>
        </div>
      </Modal>
    </div>
  );
}
