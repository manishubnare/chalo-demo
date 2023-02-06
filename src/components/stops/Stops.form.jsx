import React, { useEffect } from "react";
import { Button, Col, Form, Input, Row, message } from "antd";
import "./Stops.css";
import {
  updateData,
  useFetchStopsDetails,
  useRouteTableData,
} from "../../hooks/Routes";
import { find, get, map, some } from "lodash";
import "./Stops.css";
import HidableComponent from "../HideableComponent";

const FormItem = Form.Item;
const CustomCol = HidableComponent(Col);

function StopsForm(props) {
  const [form] = Form.useForm();
  const { data: stopTableData } = useFetchStopsDetails();
  const [messageApi, contextHolder] = message.useMessage();
  const { data: routeData } = useRouteTableData();
  const {
    selectedRowRouteId = null,
    enableUpdateExistingStops = false,
    stopData = [],
  } = props;
  useEffect(() => {
    const setFieldValue = {
      stopId: form.getFieldValue("stopId"),
      stopName: form.getFieldValue("stopName"),
      stopLat: form.getFieldValue("stopLat"),
      stopLong: form.getFieldValue("stopLong"),
    };

    form.setFieldValue(setFieldValue);
  }, [form]);

  const addStopDetails = () => {
    form
      .validateFields()
      .then((values) => {
        const stopToUpdate = enableUpdateExistingStops
          ? [...stopData]
          : stopTableData;
        const isAlreadyExistStopId = some(
          stopTableData,
          ({ stopId }) => stopId === get(values, "stopId")
        );
        if (isAlreadyExistStopId) {
          messageApi.open({
            type: "error",
            content: "Stop with duplicate Id is not valid",
          });
          return;
        }
        stopToUpdate.push(values);
        if (enableUpdateExistingStops) {
          const routeDetails = find(
            routeData,
            ({ routeId }) => routeId === selectedRowRouteId
          );
          const updateRouteDetails = {
            ...routeDetails,
            routeStops: stopToUpdate,
          };
          const updateRouteData = map(routeData, (data) => {
            if (get(data, "routeId") === selectedRowRouteId) {
              return updateRouteDetails;
            } else {
              return data;
            }
          });
          window.localStorage.setItem(
            "routes_data",
            JSON.stringify(updateRouteData)
          );
          updateData("fetchRouteData", updateRouteData);
        } else {
          window.localStorage.setItem(
            "stops_data",
            JSON.stringify(stopToUpdate)
          );
          updateData("fetchStopsData", stopToUpdate);
        }
        form.resetFields();
      })
      .catch((errorInfo) => {});
  };

  return (
    <Form form={form} layout="vertical">
      {contextHolder}
      <Row span={24} className="stop-form">
        <Col span={5}>
          <FormItem label="Stop Id" name="stopId" required>
            <Input type="text" />
          </FormItem>
        </Col>
        <Col span={5} offset={1}>
          <FormItem label="Stop Name" name="stopName" required>
            <Input type="text" />
          </FormItem>
        </Col>
        <Col span={5} offset={1}>
          <FormItem label="Stop Latitude" name="stopLat" required>
            <Input type="text" />
          </FormItem>
        </Col>
        <Col span={5} offset={1}>
          <FormItem label="Stop Longitude" name="stopLong" required>
            <Input type="text" />
          </FormItem>
        </Col>
      </Row>
      <Row className="stop-btn">
        <CustomCol>
          <Button onClick={() => addStopDetails()}>Add Stop</Button>
        </CustomCol>
        {/* <CustomCol>
          <Button onClick={() => updateStopDetails()}>Update Stop</Button>
        </CustomCol> */}
        <Col offset={1}>
          <Button onClick={() => form.resetFields()}>Clear Stop</Button>
        </Col>
      </Row>
    </Form>
  );
}

export default StopsForm;
