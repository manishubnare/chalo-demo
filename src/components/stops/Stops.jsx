import { Row, Table, Col, Input } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EditOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import {
  updateData,
  useFetchStopsDetails,
  useRouteTableData,
} from "../../hooks/Routes";
import { compact, find, get, map } from "lodash";
import HidableComponent from "../HideableComponent";
import StopsForm from "./Stops.form";

const CustomEditOutlined = HidableComponent(EditOutlined);
const CustomCheckOutlined = HidableComponent(CheckOutlined);
const CustomRow = HidableComponent(Row);

function Stops(props) {
  const {
    stopsData,
    enableUpdateExistingStops = false,
    selectedRowRouteId = null,
  } = props;
  const [editColumns, setEditColumns] = useState(false);
  const [mutableStopDetails, setMutableStopDetails] = useState(null);
  const [editableRowId, setEditableRowId] = useState(null);
  const [stopTableData, setStopTableData] = useState([]);
  const { data: routeData } = useRouteTableData();
  const { data: fetchedStopTableData } = useFetchStopsDetails();
  const routeStopTableData = useMemo(() => {
    if (enableUpdateExistingStops) {
      const { routeStops } = find(
        routeData,
        (data) => get(data, "routeId") === selectedRowRouteId
      );
      return routeStops;
    }
    return [];
  }, [routeData, enableUpdateExistingStops, selectedRowRouteId]);

  const initializeTableData = useCallback(() => {
    if (enableUpdateExistingStops) {
      const { routeStops } = find(
        routeData,
        (data) => get(data, "routeId") === selectedRowRouteId
      );
      setStopTableData([...routeStops]);
    } else {
      setStopTableData([...fetchedStopTableData]);
    }
  }, [fetchedStopTableData.length, routeStopTableData.length, editColumns]);

  useEffect(() => {
    initializeTableData();
  }, [initializeTableData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setMutableStopDetails({
      ...mutableStopDetails,
      [name]: value,
    });
  };

  const updateRowData = () => {
    const updatedStopsData = map(stopTableData, (data) => {
      if (data.stopId === editableRowId) {
        return mutableStopDetails;
      }
      return data;
    });
    if (enableUpdateExistingStops) {
      const routeDetails = find(
        routeData,
        ({ routeId }) => routeId === selectedRowRouteId
      );
      const updateRouteDetails = {
        ...routeDetails,
        routeStops: updatedStopsData,
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
        JSON.stringify(updatedStopsData)
      );
      updateData("fetchStopsData", updatedStopsData);
      setStopTableData(updatedStopsData);
    }
    setEditColumns(false);
    setMutableStopDetails(null);
  };

  const handleDeleteStopRow = (stopId) => {
    const updatedData = compact(
      map(stopsData, (data) => {
        if (get(data, "stopId") === stopId) {
          return null;
        } else {
          return data;
        }
      })
    );

    if (enableUpdateExistingStops) {
      const routeDetails = find(
        routeData,
        ({ routeId }) => routeId === selectedRowRouteId
      );
      const updateRouteDetails = {
        ...routeDetails,
        routeStops: updatedData,
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
      window.localStorage.setItem("stops_data", JSON.stringify(updatedData));
      updateData("fetchStopsData", updatedData);
    }
  };

  const getStopColumns = () => {
    const stopColumns = [
      {
        title: "Stop Id",
        key: "stopId",
        dataIndex: "stopId",
        render: (_, data) => {
          const columnValue = get(data, "stopId");
          if (editColumns && editableRowId === get(data, "stopId")) {
            return (
              <Input
                type="text"
                name="stopId"
                defaultValue={columnValue}
                onChange={(e) => handleFormChange(e)}
              />
            );
          } else {
            return `${columnValue}`;
          }
        },
      },
      {
        title: "Stop Name",
        key: "stopName",
        dataIndex: "stopName",
        render: (_, data) => {
          const columnValue = get(data, "stopName");
          if (editColumns && editableRowId === get(data, "stopId")) {
            return (
              <Input
                type="text"
                name="stopName"
                defaultValue={columnValue}
                onChange={(e) => handleFormChange(e)}
              />
            );
          } else {
            return `${columnValue}`;
          }
        },
      },
      {
        title: "Latitude",
        key: "stopLat",
        dataIndex: "stopLat",
        render: (_, data) => {
          const columnValue = get(data, "stopLat");
          if (editColumns && editableRowId === get(data, "stopId")) {
            return (
              <Input
                type="text"
                name="stopLat"
                defaultValue={columnValue}
                onChange={(e) => handleFormChange(e)}
              />
            );
          } else {
            return `${columnValue}`;
          }
        },
      },
      {
        title: "Longitude",
        key: "stopLong",
        dataIndex: "stopLong",
        render: (_, data) => {
          const columnValue = get(data, "stopLong");
          if (editColumns && editableRowId === get(data, "stopId")) {
            return (
              <Input
                type="text"
                name="stopLong"
                defaultValue={columnValue}
                onChange={(e) => handleFormChange(e)}
              />
            );
          } else {
            return `${columnValue}`;
          }
        },
      },
    ];

    if (true) {
      stopColumns.push({
        title: "Actions",
        key: "actions",
        dataIndex: "actions",
        render: (_, data) => {
          const hideEditButton =
            editColumns && editableRowId === get(data, "stopId");
          return (
            <Row>
              <Col>
                <CustomEditOutlined
                  isHidden={hideEditButton}
                  onClick={() => (
                    setEditColumns(true),
                    setMutableStopDetails(data),
                    setEditableRowId(get(data, "stopId"))
                  )}
                />
                <CustomCheckOutlined
                  isHidden={!hideEditButton}
                  onClick={() => updateRowData()}
                />
              </Col>
              <Col offset={2}>
                <DeleteOutlined
                  onClick={() => handleDeleteStopRow(get(data, "stopId"))}
                />
              </Col>
            </Row>
          );
        },
      });
    }

    return stopColumns;
  };

  return (
    <div>
      <Row>
        <Table
          columns={getStopColumns()}
          dataSource={stopTableData}
          scroll={{
            y: 240,
          }}
          pagination={false}
        />
      </Row>
      <CustomRow isHidden={!enableUpdateExistingStops}>
        <StopsForm
          stopData={stopTableData}
          enableUpdateExistingStops={enableUpdateExistingStops}
          selectedRowRouteId={selectedRowRouteId}
        />
      </CustomRow>
    </div>
  );
}

export default Stops;
