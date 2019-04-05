import {SIZE, PANELMARGIN, PANELTOP, PANELLEFT, UNITS, IMAGE_DRONE, IMAGE_BLAST} from "./constants";
import Utils from "./Utils";
import Locations from "./Locations";
import Directions from "./Directions";

export default class Piece {
    next: Piece;
    el: any;
    position: any = {x: 1, y: 1};

    constructor(
        public x: number,
        public y: number,
        public type: string = "body",
        public direction: string = "RIGHT") {

        this.el = document.createElement("img");
        this.el.src = IMAGE_DRONE;

        this.next = null;
        // Enable for a neat effect
        this.setType(type);
        this.setPos(this.x, this.y);
        // document.body.appendChild(this.el);
        const panel: any = document.getElementById("panel");
        panel.appendChild(this.el);
    }

    static getSizePerUnit() {
        let width: number = document.body.clientWidth - PANELMARGIN;
        let sizePerUnit: number = Math.floor(width / UNITS);
        sizePerUnit = SIZE;
        return sizePerUnit;
    }

    static getPanelWidth() {
        let width: number = document.body.clientWidth - PANELMARGIN;
        let sizePerUnit: number = Math.floor(width / UNITS);
        let panelWidth: number = sizePerUnit * UNITS;

        panelWidth = UNITS * SIZE;

        return panelWidth;
    }

    static getPanelHeight() {
        let height: number = document.body.clientHeight - PANELMARGIN;
        let sizePerUnit: number = Math.floor(height / UNITS);
        let panelHeight: number = sizePerUnit * UNITS;

        panelHeight = UNITS * SIZE;

        return panelHeight;
    }

    static getPanelTop() {
        let panel: any = document.getElementById("panel");
        return panel ? panel.offsetTop : PANELTOP;
    }

    static getPanelLeft() {
        let panel: any = document.getElementById("panel");
        return panel ? panel.offsetLeft : PANELLEFT;
    }

    static getXByPositionX(positionX: number) {
        let x: number;
        x = ((positionX - 1) * SIZE) + Piece.getPanelLeft()
        return x;
    }

    static getPositionX(x: number) {
        let positionX: number;
        positionX = (x - Piece.getPanelLeft()) / SIZE + 1;
        return positionX;
    }

    static getYByPositionY(positionY: number) {
        let y: number;
        y = ((positionY - 1) * SIZE) + Piece.getPanelTop();
        return y;
    }

    static getPositionY(y: number) {
        let positionY: number;
        positionY = (y - Piece.getPanelTop()) / SIZE + 1;
        return positionY;
    }

    static getDirectionText(piece: any) {
        let direction: string;
        switch (piece.direction) {
            case "DOWN":
                direction = "SOUTH";
                break;
            case "LEFT":
                direction = "WEST";
                break;
            case "UP":
                direction = "NORTH";
                break;
            case "RIGHT":
            default:
                direction = "EAST";
                break;
        }

        return direction;
    }

    static clearBlast(x: number, y: number) {
        let className = "blast_" + x + "_" + y;
        let elements = document.getElementsByClassName(className);
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    static setBlast(x: number, y: number) {
        let el: any = document.createElement("img");
        let type: string = "image";
        let className = "blast_" + x + "_" + y;

        el.src = IMAGE_BLAST;
        el.style.top = `${y}px`;
        el.style.left = `${x}px`;
        el.classList.add("blast", type);
        el.classList.add(className, type);
        // document.body.appendChild(el);
        const panel: any = document.getElementById("panel");
        panel.appendChild(el);
    }

    static showStatus(piece: any) {
        const status: any = document.getElementById("status");
        let el: HTMLSpanElement = document.createElement("span");
        el.innerHTML = `Position - X: ${Piece.getPositionX(piece.x)}, Y: ${Piece.getPositionY(piece.y)}, Direction: ${Piece.getDirectionText(piece)}`;
        status.innerHTML = "";
        status.appendChild(el);
    }

    setPos(x: number, y: number): void {
        // CSS nove the element
        this.el.style.top = `${y}px`;
        this.el.style.left = `${x}px`;

        // this.el.style.transform = `translate(${x}px, ${y}px)`;

        // reset CSS classnames basically
        this.applyClass();

        // Save the location of this piece to occupied spaces
        // - Head cannot collide with itself
        if (this.type !== "head" && this.type !== "food") {
            Locations.set(x, y);
        }
    }

    move(x: number, y: number, direction: string = "RIGHT"): void {
        // Transition through walls
        if (x === Piece.getPanelLeft() && y === Piece.getPanelTop()) {
            x = Piece.getPanelLeft();
            y = Piece.getPanelTop();
        } else if (x < Piece.getPanelLeft()) {
            x = Piece.getPanelLeft();
        } else if (y < Piece.getPanelTop()) {
            y = Piece.getPanelTop();
        } else if (x >= (Piece.getPanelWidth() + Piece.getPanelLeft())) {
            x = (Piece.getPanelWidth() + Piece.getPanelLeft()) - SIZE;
        } else if (y >= (Piece.getPanelHeight() + Piece.getPanelTop())) {
            y = (Piece.getPanelHeight() + Piece.getPanelTop()) - SIZE;
        }

        // Save the old direction
        let tdirection = this.direction;
        // Set new direction of the piece
        this.direction = direction;
        // Move HTML Element to new spot
        this.setPos(x, y);
        // If there is a next piece move it to old position
        if (this.next !== null) {
            // direction instead of old one this is needed to have a fluid motion
            this.next.move(x, y, this.type === "head" ? this.direction : tdirection);
        } else {
            // We are the last piece, previous position
            // is now empty, clear it
            Locations.remove(this.x, this.y);
        }

        // if I"m part of body and no one is following me
        // then I must be the tail
        if (this.next === null && this.type === "body") {
            this.el.classList.add("tail");
        }

        // if me and the piece following me are at the same spot
        // then piece following me must be the food we just swallowed
        if (this.next !== null && this.next.x === x && this.next.y === y) {
            this.next.el.classList.add("gulp");
        }

        // Bendy corners
        if (this.next !== null && this.direction !== this.next.direction) {
            this.el.classList.add(`${this.direction}-${this.next.direction}`);
        }

        // store new values
        this.x = x;
        this.y = y;

        Piece.showStatus(this);
    }

    setType(type: string): void {
        this.type = type;
        this.applyClass();
    }

    applyClass(): void {
        this.el.className = "";
        this.el.classList.add("cell", this.type, this.direction);
    }

    remove(): void {
        // Remove the piece, it"s location and HTML element
        // This is needed to free up memory
        Utils.removeNode(this.el);
        Locations.remove(this.x, this.y);

        // Do the same for all linked pieces
        if (this.next) {
            this.next.remove();
            this.next = null;
        }
    }
}
