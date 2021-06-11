import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import { Label, Text, Tag, Group } from 'react-konva';

import { NodeProps } from '../interfaces';

function textColorFromBg(bgColor: string) {
    const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? '#000000' : '#ffffff';
}

export default class Node extends React.Component<NodeProps> {
    render(): JSX.Element {
        const {
            rule,
            conclusion,
            id,
            x,
            y,
            selected,
            nHided,
            nDescendants,
            setFocusText,
            setNodeOnFocus,
            updateNodeState,
            toggleNodeSelection,
            unfoldOnClick,
        } = this.props;

        const bgColor = '#8d99ae';

        const labelProps = {
            onMouseEnter: (e: KonvaEventObject<MouseEvent>) => {
                setFocusText(e.target.attrs.text);
            },
            onMouseLeave: () => setFocusText(''),
        };
        const tagProps = {
            fill: bgColor,
            stroke: selected ? 'red' : 'black',
            strokeWidth: selected ? 3 : 1,
        };
        const textProps = {
            align: 'center',
            fill: textColorFromBg(bgColor),
            fontSize: 15,
            height: 35,
            padding: 10,
            width: 300,
        };
        return (
            <Group
                draggable
                id={id.toString()}
                key={id}
                onDragMove={(e) => {
                    updateNodeState(id, e.target.attrs.x, e.target.attrs.y);
                }}
                x={x}
                y={y}
                onClick={(e) => {
                    if (e.evt.button === 0) {
                        if (e.evt.shiftKey) {
                            toggleNodeSelection(id);
                        } else if (rule === 'π') {
                            unfoldOnClick(id);
                        }
                    } else if (e.evt.button === 2) {
                        setNodeOnFocus(id);
                        const menuNode = document.getElementById('menu');
                        if (menuNode) {
                            menuNode.style.top = `${e.evt.clientY}px`;
                            menuNode.style.left = `${e.evt.clientX}px`;
                            menuNode.style.display = 'initial';
                            window.addEventListener('click', () => {
                                menuNode.style.display = 'none';
                            });
                        } else {
                            // Apagar depois que garantido que o menu está ok
                            alert('Problema com menu do canvas');
                        }
                    }
                }}
            >
                <Label {...labelProps} x={0} y={0}>
                    <Tag {...tagProps} />
                    <Text {...textProps} text={conclusion} />
                </Label>
                <Label {...labelProps} x={0} y={35}>
                    <Tag {...tagProps} />
                    <Text {...textProps} text={rule} />
                </Label>
                <Label {...labelProps} x={0} y={70}>
                    <Tag {...tagProps} />
                    <Text
                        {...textProps}
                        text={
                            (nHided ? '#hided: ' + nHided : '') +
                            (nDescendants ? '#descendants: ' + (nDescendants - 1) : '')
                        }
                        height={25}
                        fontSize={12}
                        padding={8}
                    />
                </Label>
            </Group>
        );
    }
}
