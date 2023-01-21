import React, {MouseEventHandler, useEffect, useState} from 'react';
import './Pain.css'

const containerHeight = 400;
const containerWidth = 700;
const figureHeight = 50;
const figureWidth = 50;

const step = 5;


type Direction = '+' | '-';

type Shape = 'square' | 'hex' | 'triangle' | 'circle';

const initialFigure: Figure = {
    id: 0,
    leftDirection: '+',
    topDirection: '+',
    leftPosition: 325,
    topPosition: 175,
    shape: 'square',
    intervalMs: 200,
    intervalId: null,
};

type Figure = {
    id: number,
    leftDirection: Direction,
    topDirection: Direction,
    leftPosition: number,
    topPosition: number,
    shape: Shape,
    intervalMs: number,
    intervalId: NodeJS.Timer | null,
}
const getIntervalBySpeed = (speedInPercent: number): number =>
    1000 - speedInPercent * 10;

export const Pain = () => {
    const [figures, setFigures] = useState([initialFigure]);
    const [selectedFigureIndex, setSelectedFigureIndex] = useState<number | null>(null);

    useEffect(() => restartFigure(0),[]);

    const onAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const element = event.currentTarget.getBoundingClientRect();

        const leftPosition = event.clientX - element.left;
        const topPosition = event.clientY - element.top;

        setFigures([...figures, {
            id: Math.random(),
            leftDirection: '+',
            topDirection: '+',
            leftPosition,
            topPosition,
            shape: 'square',
            intervalMs: 200,
            intervalId: null,
        }]);
        restartFigure(figures.length);
    }

    const figureSpeedChange = (figureIndex: number) => (event: React.FormEvent<HTMLInputElement>) => {
        const speedInPercent = parseInt(event.currentTarget.value);
        const newIntervalMs = getIntervalBySpeed(speedInPercent);

        const newFigures = figures.map((it, index) =>
            figureIndex === index ? { ...it, intervalMs: newIntervalMs } : it
        );

        setFigures(newFigures);
        restartFigure(figureIndex);
    }

    const figureShapeChange = (figureIndex: number) => (event: React.FormEvent<HTMLSelectElement>) => {
        const newFigures = figures.map((it, index) => 
            figureIndex === index ? { ...it, shape: event.currentTarget.value as/*s*/ Shape } : it
        );
        
        setFigures(newFigures);
    }

    const moveRight = (figure: Figure, step: number): number => {    //движение вправо, +
        if (figure.leftPosition + figureWidth <= containerWidth - step) {
            return figure.leftPosition + step;
        } else {
            return containerWidth - figureWidth;
        }
    }

    const moveLeft = (figure: Figure, step: number): number => { //движение влево, -
        if (figure.leftPosition >= step) {
            return figure.leftPosition - step;
        } else {
            return 0;
        }
    }

    const moveUp = (figure: Figure, step: number): number => {   //движение вверх, +
        if (figure.topPosition >= step) {
            return figure.topPosition - step;
        } else {
            return 0;
        }
    }

    const moveDown = (figure: Figure, step: number): number => {   //движение вниз, -
        if (figure.topPosition + figureHeight <= containerHeight - step) {
            return figure.topPosition + step;
        } else {
            return containerHeight - figureHeight;
        }
    }
    
    const moveFigure = (figureIndex: number) => {
        setFigures((currentFigures) => {
            return currentFigures.map((it, index) => {
                if (figureIndex !== index) {
                    return it;
                }
                
                let leftDirection = it.leftDirection;
                let topDirection = it.topDirection;
                if (it.leftPosition === 0) {
                    leftDirection = '+';
                }

                if (it.leftPosition === containerWidth - figureWidth) {
                    leftDirection = '-';
                }

                if (it.topPosition === 0) {
                    topDirection = '-';
                }

                if (it.topPosition === containerHeight - figureHeight) {
                    topDirection = '+';
                }

                return {
                    ...it,
                    leftDirection,
                    topDirection,
                    leftPosition: leftDirection === '+' ? moveRight(it,  step) : moveLeft(it, step),
                    topPosition: topDirection === '+' ? moveUp(it, step) : moveDown(it, step)
                };
            });

        });
    }

    const restartFigure = (figureIndex: number) => {
        setFigures((currentFigures) =>
            currentFigures.map((it, index) => {
                if (figureIndex !== index) {
                    return it;
                }
                if (it.intervalId !== null) {
                    clearInterval(it.intervalId);
                }

                const intervalId = setInterval(() => {
                    moveFigure(figureIndex);
                }, it.intervalMs);

                return { ...it, intervalId };
            })
        );
    }

    const deleteFigure = (figureId: number, intervalId: NodeJS.Timer | null) => () => {
        setFigures((currentFigures) => currentFigures.filter(it => it.id !== figureId));
        if (intervalId !== null) {
            clearInterval(intervalId);
        }
    };

    return (
        <div>
            <div className='bigContainer'>
                <div onClick={onAreaClick} className="container">
                    {
                        figures.map((it, index) => {
                            let className = it.shape + (index === selectedFigureIndex ? ' selected' : '');
                            return (
                                <div
                                    key={it.id}
                                    className={className}
                                    style={{
                                        left: it.leftPosition,
                                        top: it.topPosition
                                    }}
                                />
                            );
                        })
                    }
                </div>
                <div className='settings'>
                    {
                        figures.map((it, index) => (
                            <div
                                key={it.id}
                                className="settingsEl"
                                onMouseEnter={() => setSelectedFigureIndex(index)}
                                onMouseLeave={() => setSelectedFigureIndex(null)}
                            >
                                <select value={it.shape} onChange={figureShapeChange(index)}>
                                    <option value="square">Square</option>
                                    <option value="circle">Circle</option>
                                    <option value="hex">Hex</option>
                                    <option value="triangle">Triangle</option>
                                </select>
                                <input min="0" max="100" type="range" onInput={figureSpeedChange(index)} />
                                <button onClick={deleteFigure(it.id, it.intervalId)} >Delete figure</button>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};