import { uniqueId } from "@common/uniqueId";

describe("uniqueId", () => {
  it("should generate a unique ID", () => {
    const id1 = uniqueId();
    const id2 = uniqueId();
    expect(id1).not.toBe(id2);
  });

  it("should generate a unique ID with a prefix", () => {
    const prefix = "test";
    const id = uniqueId(prefix);
    expect(id).toMatch(new RegExp(`^${prefix}-[a-f0-9]{8}$`));
  });
});
