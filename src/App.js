import React, { Component } from 'react';
import { withRouter } from "react-router-dom";

import './App.css';

import Map from './Map.js'
import Spinner from './Spinner.js'
import MapStyleSwitcher from './MapStyleSwitcher.js'
import OSMController from './OSMController.js'

import "antd/dist/antd.css";

class App extends Component {
    geoJson;

    constructor(props) {
        super(props);

        this.updateData = this.updateData.bind(this);
        this.onMapStyleChange = this.onMapStyleChange.bind(this);
        this.onMapMoved = this.onMapMoved.bind(this);

        const urlParams = this.getParamsFromURL();
        this.state = {
            geoJson: null,
            loading: true,
            mapStyle: 'mapbox://styles/mapbox/light-v10',
            zoom: urlParams.z || 13,
            center: [
                urlParams.lng || -43.19663687394814,
                urlParams.lat || -22.968419833847065]
        };
    }

    getParamsFromURL() {
        const possibleParams = ['z', 'lat', 'lng'];
        const urlParams = new URLSearchParams(this.props.location.search);
        let paramsObj = {}

        possibleParams.forEach( p => {
            let value = urlParams.get(p);
            if (value) {
                paramsObj[p] = value;
            }
        })

        return paramsObj;
    }

    updateData(bbox) {
        this.setState({ loading: true });

        OSMController.getData(bbox)
            .then(data => {
                this.setState({
                    geoJson: data,
                    loading: false
                });
            });
    }

    onMapStyleChange(newMapStyle) {
        this.setState({ mapStyle: newMapStyle});
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.location !== prevProps.location) {
            this.onRouteChanged();
        }
        
        if (this.state.zoom !== prevState.zoom ||
            this.state.lat !== prevState.lat ||
            this.state.lng !== prevState.lng) {
            let params = '?';
            params += `lat=${this.state.lat.toFixed(7)}`;
            params += `&lng=${this.state.lng.toFixed(7)}`;
            params += `&z=${this.state.zoom.toFixed(2)}`;
            this.props.history.push({
                search: params
            })
        }
    }

    onRouteChanged() {
        // @todo Fix infinite loop
        // this.setState(this.getParamsFromURL());
    }

    onMapMoved(newState) {
        this.setState(newState);
    }

    render() {
        return (
            <div>
                <Map
                    data={this.state.geoJson}
                    style={this.state.mapStyle}
                    zoom={this.state.zoom}
                    center={this.state.center}
                    updateData={this.updateData}
                    onMapMoved={this.onMapMoved}
                />

                <Spinner loading={this.state.loading}/>

                <MapStyleSwitcher onMapStyleChange={this.onMapStyleChange}/>
            </div>
        );
    }
}

export default withRouter(App);