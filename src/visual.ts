"use strict";
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

import DataView = powerbi.DataView;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualUpdateType = powerbi.VisualUpdateType;


import * as React from "react";
import * as ReactDOM from "react-dom";
import App, { AppParams } from './App';
import { VisualSettings } from "./settings";
import { getDomain } from "./utils";

import "./../style/visual.less";

export class Visual implements IVisual {
    private target: HTMLElement;
    private updateState: (newState: AppParams) => void;

    private visualSettings: VisualSettings;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        this.formattingSettingsService = new FormattingSettingsService();

        this.updateState = () => {};

        const reactRoot = React.createElement(App, {
            updateCallback: (updateFunc: (newState: AppParams) => void) => {
                this.updateState = updateFunc;
            },
        });

        this.target = options.element;
        ReactDOM.render(reactRoot, this.target);
    }

    public update(options: VisualUpdateOptions) {
        if (!(options.type & ~VisualUpdateType.Resize & ~VisualUpdateType.ResizeEnd)) {
            return;
        }

        const dataView = options.dataViews.length > 0 ? options.dataViews[0] : null;
        this.visualSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualSettings, dataView);
        const settings = this.visualSettings.filter;

        if (dataView) {
            const table = dataView.table;
            if (table && table.rows.length > 0) {
                this.updateState({
                    url: table.rows[0][0].toString(),
                    allowedDomains: settings.allowedDomains.value.split(',').map(getDomain).filter(domain => domain !== null),
                })
            }
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.visualSettings);
    }

}
