import GenTypescriptModel from '../GenTypescriptModel.js';
import { Node } from '@aphro/schema-api';
import { createCompiler } from '@aphro/schema';

const { compileFromString } = createCompiler();

const IDOnlySchema = `
engine: postgres
db: test

IDOnly as Node {
  id: ID<IDOnly>
}
`;

const PrimitiveFieldsSchema = `
engine: postgres
db: test

PrimitiveFields as Node {
  id: ID<PrimitiveFields>
  mrBool: bool
  mrInt32: int32
  mrInt64: int64
  mrUint: uint64
  mrFloat: float32
  mrString: string
}
`;

const OutboundFieldEdgeSchema = `
engine: postgres
db: test

Foo as Node {
  fooId: ID<Foo>
} & OutboundEdges {
  foos: Edge<Foo.fooId>
}
`;

const OutboundForeignKeyEdgeSchema = `
engine: postgres
db: test

Bar as Node {
} & OutboundEdges {
  foos: Edge<Foo.barId>
}
`;

test('Generating an ID only model', () => {
  const contents = genIt(compileFromString(IDOnlySchema)[1].nodes.IDOnly).contents;
  expect(contents).toEqual(
    `// SIGNED-SOURCE: <a92063a419b3fdeaba407c8fd67efbf8>
import { P } from "@aphro/query-runtime-ts";
import { Model } from "@aphro/model-runtime-ts";
import { SID_of } from "@strut/sid";

export type Data = {
  id: SID_of<IDOnly>;
};

export default class IDOnly extends Model<Data> {
  get id(): SID_of<IDOnly> {
    return this.data.id;
  }
}
`,
  );
});

test('Generating all primitive fields', () => {
  const contents = genIt(
    compileFromString(PrimitiveFieldsSchema)[1].nodes.PrimitiveFields,
  ).contents;
  expect(contents).toEqual(`// SIGNED-SOURCE: <e88852c6860b87cb7a313e1d54871e66>
import { P } from "@aphro/query-runtime-ts";
import { Model } from "@aphro/model-runtime-ts";
import { SID_of } from "@strut/sid";

export type Data = {
  id: SID_of<PrimitiveFields>;
  mrBool: boolean;
  mrInt32: number;
  mrInt64: string;
  mrUint: string;
  mrFloat: number;
  mrString: string;
};

export default class PrimitiveFields extends Model<Data> {
  get id(): SID_of<PrimitiveFields> {
    return this.data.id;
  }

  get mrBool(): boolean {
    return this.data.mrBool;
  }

  get mrInt32(): number {
    return this.data.mrInt32;
  }

  get mrInt64(): string {
    return this.data.mrInt64;
  }

  get mrUint(): string {
    return this.data.mrUint;
  }

  get mrFloat(): number {
    return this.data.mrFloat;
  }

  get mrString(): string {
    return this.data.mrString;
  }
}
`);
});

test('Outbound field edge', () => {
  const contents = genIt(compileFromString(OutboundFieldEdgeSchema)[1].nodes.Foo).contents;
  expect(contents).toEqual(`// SIGNED-SOURCE: <c7e9a1b500db49dc134745c01da4495d>
import { P } from "@aphro/query-runtime-ts";
import { Model } from "@aphro/model-runtime-ts";
import { SID_of } from "@strut/sid";
import FooQuery from "./FooQuery.js";

export type Data = {
  fooId: SID_of<Foo>;
};

export default class Foo extends Model<Data> {
  get fooId(): SID_of<Foo> {
    return this.data.fooId;
  }

  queryFoos(): FooQuery {
    return FooQuery.fromId(this.fooId);
  }
}
`);
});

test('Outbound foreign key edge', () => {
  const contents = genIt(compileFromString(OutboundForeignKeyEdgeSchema)[1].nodes.Bar).contents;
  expect(contents).toEqual(`// SIGNED-SOURCE: <aae232d98ea740396d0665e7e3536165>
import { P } from "@aphro/query-runtime-ts";
import { Model } from "@aphro/model-runtime-ts";
import { SID_of } from "@strut/sid";
import FooQuery from "./FooQuery.js";
import Foo from "./Foo.js";

export type Data = {};

export default class Bar extends Model<Data> {
  queryFoos(): FooQuery {
    return FooQuery.create().whereBarId(P.equals(this.id));
  }
}
`);
});

function genIt(schema: Node) {
  return new GenTypescriptModel('', schema).gen();
}
