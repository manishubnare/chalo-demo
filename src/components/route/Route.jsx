import { Button, Col, Form, Input, Row, message, Select } from "antd";
import { get, some } from "lodash";
import React, { useEffect, useState } from "react";
import {
  updateData,
  useFetchStopsDetails,
  useRouteTableData,
} from "../../hooks/Routes";
import Header from "../Header";
import HidableComponent from "../HideableComponent";
import Stops from "../stops/Stops";
import StopsForm from "../stops/Stops.form";
import "./Route.css";

const CustomRow = HidableComponent(Row);
const CustomStopForm = HidableComponent(StopsForm);
const FormItem = Form.Item;
const initialRouteState = {
  routeName: "",
  routeDirection: "",
  routeId: "",
  routeStatus: "",
  routeStops: [],
};

const ROUTE_DIRECTION = [
  {
    label: "UP",
    value: "UP",
  },
  {
    label: "DOWN",
    value: "DOWN",
  },
];

const ROUTE_STATUS = [
  {
    label: "ACTIVE",
    value: "ACTIVE",
  },
  {
    label: "INACTIVE",
    value: "INACTIVE",
  },
];

function AddRoute(props) {
  const [routeDetails, setRouteDetails] = useState(initialRouteState);
  const [showStopFields, setShowStopFields] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { data: stopData, isLoading } = useFetchStopsDetails();
  const { data: routesData } = useRouteTableData();
  const [form] = Form.useForm();

  useEffect(() => {
    const setFieldValue = {
      routeName: form.getFieldValue("routeName"),
      routeDirection: form.getFieldValue("routeDirection"),
      routeId: form.getFieldValue("routeId"),
      routeStatus: form.getFieldValue("routeStatus"),
    };
    form.setFieldsValue({
      ...setFieldValue,
    });
  }, [form]);

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const routeDetails = {
          ...values,
          routeStops: stopData,
        };
        const allRoutesData = routesData;
        const isAlreadyExistingRouteId = some(
          routesData,
          ({ routeId }) => routeId === get(values, "routeId")
        );
        if (isAlreadyExistingRouteId) {
          messageApi.open({
            type: "error",
            content: "Route Id Already exists, Duplicate route id is not valid",
          });
          return;
        }
        allRoutesData.push(routeDetails);
        window.localStorage.setItem(
          "routes_data",
          JSON.stringify(allRoutesData)
        );
        window.localStorage.removeItem("stops_data");
        updateData("fetchRouteData", allRoutesData);
        form.resetFields();
        messageApi.open({
          type: "success",
          content: "Successfully Added Route",
        });
      })
      .catch((errorInfo) => {});
  };

  return (
    <div>
      <Header />
      {contextHolder}
      <Row span={12} className="form-content">
        <Col span={11} offset={1}>
          <Form form={form} layout="vertical">
            <Row>
              <Col span={12}>
                <FormItem
                  label="Route Id"
                  name="routeId"
                  initialValue={routeDetails.routeName}
                  rules={[{ required: true }]}
                >
                  <Input type="text" />
                </FormItem>
              </Col>
              <Col span={11} offset={1}>
                <FormItem
                  label="Route name"
                  name="routeName"
                  initialValue={routeDetails.routeName}
                  rules={[{ required: true }]}
                >
                  <Input type="text" />
                </FormItem>
              </Col>
            </Row>
            <Row span={24}>
              <Col span={12}>
                <FormItem
                  label="Route Direction"
                  name="routeDirection"
                  initialValue={routeDetails.routeName}
                  rules={[{ required: true }]}
                >
                  <Select
                    className="select-field-pos"
                    defaultValue="UP"
                    options={ROUTE_DIRECTION}
                  />
                </FormItem>
              </Col>
              <Col span={11} offset={1}>
                <FormItem
                  label="Route Status"
                  name="routeStatus"
                  initialValue={routeDetails.routeName}
                  rules={[{ required: true }]}
                >
                  <Select
                    className="select-field-pos"
                    defaultValue="ACTIVE"
                    options={ROUTE_STATUS}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row span={24}>
              <Col className="add-more-stop-btn" span={6}>
                <Button onClick={() => setShowStopFields(true)}>
                  + Add Route Stops
                </Button>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <CustomStopForm isHidden={!showStopFields} />
              </Col>
            </Row>
          </Form>
        </Col>
        <Col span={11} offset={1}>
          <CustomRow isHidden={!showStopFields}>
            <Stops stopsData={stopData} form={form} />
          </CustomRow>
        </Col>
      </Row>
      <Row className="add-route-btn">
        <Button onClick={() => handleFormSubmit()}>Add Route</Button>
      </Row>
    </div>
  );
}

export default AddRoute;
