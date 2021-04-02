import React, { Component } from 'react';
import { Stage, Layer } from 'react-konva';
import PropTypes from 'prop-types';
import Node from './Node';
import Line from './Line';

function processDot(dot) {
  const numberOfNodes = (dot.match(/label/g) || []).length / 2;
  const nodes = new Array(numberOfNodes);
  const lines = dot
    .slice(dot.indexOf('{') + 1, dot.indexOf('}') - 2)
    .replace(/(\n|\t)/gm, '')
    .split(';');
  lines.forEach((line) => {
    if (line.search('label') !== -1) {
      const id = line.split('[')[0].trim().slice(1, -1);
      const text = line.slice(line.indexOf('label') + 9, line.lastIndexOf('"'));
      if (line.split('[')[0].search('c') === -1) {
        const node = {
          id,
          rule: text,
          children: [],
          showingChildren: false,
        };
        nodes[node.id] = node;
      } else {
        nodes[id.replace('c', '')].conclusion = text;
      }
    } else if (line.search('->') !== -1) {
      const edgeNodes = line
        .split('->')
        .map((element) => element.trim().replaceAll('"', '').replace('c', ''));
      if (edgeNodes[0] !== edgeNodes[1]) {
        nodes[edgeNodes[1]].children.push(edgeNodes[0]);
      }
    }
  });
  return nodes;
}

function handleWheel(e) {
  e.evt.preventDefault();

  const scaleBy = 1.08;
  const stage = e.target.getStage();
  const oldScale = stage.scaleX();
  const mousePointTo = {
    x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
    y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
  };

  const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  return {
    stageScale: newScale,
    stageX:
      -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
    stageY:
      -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
  };
}

export default class Canvas extends Component {
  constructor(props) {
    super(props);

    const { dot } = this.props;

    const proofNodes = processDot(dot);

    this.state = {
      canvasWidth: 520,
      canvasHeight: 300,
      stageScale: 1,
      stageX: 0,
      stageY: 0,
      proofNodes,
      showingNodes: {},
      showingEdges: {},
    };
  }

  componentDidMount() {
    const { showingNodes, proofNodes, canvasWidth } = this.state;

    showingNodes['0c'] = new Node(
      this.nodeProps(
        proofNodes[0].conclusion,
        true,
        `${proofNodes[0].id}c`,
        canvasWidth * 0.5,
        10
      )
    );

    this.setState({
      showingNodes,
      canvasWidth:
        document.getElementsByClassName('visualizer')[0].offsetWidth - 30,
      canvasHeight:
        window.innerHeight -
        (document.getElementsByClassName('navbar')[0].offsetHeight +
          20 +
          document.getElementsByClassName('proof-name')[0].offsetHeight +
          document.getElementsByClassName('node-text')[0].offsetHeight +
          50),
    });
  }

  nodeProps = (children, conclusion, id, x, y) => {
    const { setCurrentText, setFocusText } = this.props;
    return {
      children,
      conclusion,
      id,
      onClick: this.onClick,
      updateParentState: this.updateParentState,
      setFocusText,
      setCurrentText,
      x,
      y,
    };
  };

  lineProps = (key, from, to) => ({
    key,
    points: [from.x + 150, from.y, to.x + 150, to.y + 36],
  });

  onClick = (e) => {
    let { id, x, y, conclusion } = e.target.parent.attrs;
    const { proofNodes, showingNodes, showingEdges } = this.state;
    id = id.replace('c', '');

    if (conclusion && proofNodes[id].showingChildren) {
      proofNodes[id].showingChildren = false;
      showingNodes[`${id}c`].props.showingChildren = false;
      delete showingNodes[id];
      delete showingEdges[`${id}->${id}c`];
      const nodesToBeRemoved = this.recursivelyGetChildren(id);
      nodesToBeRemoved.forEach((node) => {
        proofNodes[node].showingChildren = false;
        delete showingNodes[node];
        delete showingNodes[`${node}c`];
        Object.keys(showingEdges)
          .filter((edgeKey) => {
            const edges = edgeKey.split('->');
            return (
              node === edges[0] ||
              `${node}c` === edges[0] ||
              node === edges[1] ||
              `${node}c` === edges[1]
            );
          })
          .forEach((edge) => {
            delete showingEdges[edge];
          });
      });
    } else if (conclusion) {
      showingNodes[proofNodes[id].id] = new Node(
        this.nodeProps(
          proofNodes[id].rule,
          false,
          proofNodes[id].id,
          x,
          y + 100
        )
      );
      showingEdges[`${proofNodes[id].id}->${proofNodes[id].id}c`] = new Line(
        this.lineProps(
          `${proofNodes[id].id}->${proofNodes[id].id}c`,
          showingNodes[proofNodes[id].id].props,
          showingNodes[`${proofNodes[id].id}c`].props
        )
      );
      const lenChildren = proofNodes[id].children.length - 1;
      proofNodes[id].children.forEach((child, i) => {
        const childNode = proofNodes[child];
        showingNodes[`${childNode.id}c`] = new Node(
          this.nodeProps(
            childNode.conclusion,
            true,
            `${childNode.id}c`,
            x + (i - lenChildren / 2) * 350,
            y + 200
          )
        );
        showingEdges[`${childNode.id}c->${proofNodes[id].id}`] = new Line(
          this.lineProps(
            `${childNode.id}c->${proofNodes[id].id}`,
            showingNodes[`${childNode.id}c`].props,
            showingNodes[proofNodes[id].id].props
          )
        );
      });
      proofNodes[id].showingChildren = true;
      showingNodes[`${id}c`].props.showingChildren = true;
    }
    this.setState({ showingNodes, proofNodes, showingEdges });
  };

  updateParentState = (key, x, y) => {
    const { showingNodes, showingEdges } = this.state;
    showingNodes[key].props.x = x;
    showingNodes[key].props.y = y;
    Object.keys(showingEdges)
      .filter((edgeKey) => edgeKey.indexOf(key) !== -1)
      .forEach((edge) => {
        const [from, to] = edge.split('->');
        showingEdges[edge] = new Line(
          this.lineProps(edge, showingNodes[from].props, showingNodes[to].props)
        );
      });
    this.setState({ showingNodes, showingEdges });
  };

  recursivelyGetChildren(nodeId) {
    const { proofNodes } = this.state;
    let nodes = [];
    proofNodes[nodeId].children.forEach((node) => {
      nodes = nodes.concat([node]);
      if (proofNodes[node].showingChildren)
        nodes = nodes.concat(this.recursivelyGetChildren(node));
    });
    return nodes;
  }

  render() {
    const {
      canvasWidth,
      canvasHeight,
      stageScale,
      stageX,
      stageY,
      showingNodes,
      showingEdges,
    } = this.state;
    return (
      <Stage
        draggable
        width={canvasWidth}
        height={canvasHeight}
        onWheel={(e) => this.setState(handleWheel(e))}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stageX}
        y={stageY}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        <Layer>
          {Object.keys(showingNodes).length === 0
            ? []
            : Object.keys(showingNodes).map(function (key) {
                return showingNodes[key].render();
              })}
          {Object.keys(showingEdges).length === 0
            ? []
            : Object.keys(showingEdges).map(function (key) {
                return showingEdges[key];
              })}
        </Layer>
      </Stage>
    );
  }
}

Canvas.propTypes = {
  dot: PropTypes.any,
  setCurrentText: PropTypes.func,
  setFocusText: PropTypes.func,
};
