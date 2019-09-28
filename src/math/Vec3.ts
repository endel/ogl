import * as Vec3Func from './functions/Vec3Func.js';
import { Mat4 } from './Mat4.js';
import { Quat } from './Quat.js';

export class Vec3 extends Array<number> {
    constant: number;

    constructor(x = 0, y = x, z = x) {
        super(x, y, z);
        return this;
    }

    get x() {
        return this[0];
    }

    set x(v) {
        this[0] = v;
    }

    get y() {
        return this[1];
    }

    set y(v) {
        this[1] = v;
    }

    get z() {
        return this[2];
    }

    set z(v) {
        this[2] = v;
    }

    set(x, y = x, z = x) {
        if (x.length) return this.copy(x);
        Vec3Func.set(this, x, y, z);
        return this;
    }

    copy(v: Vec3) {
        Vec3Func.copy(this, v);
        return this;
    }

    add(va: Vec3, vb?: Vec3) {
        if (vb) Vec3Func.add(this, va, vb);
        else Vec3Func.add(this, this, va);
        return this;
    }

    sub(va: Vec3, vb?: Vec3) {
        if (vb) Vec3Func.subtract(this, va, vb);
        else Vec3Func.subtract(this, this, va);
        return this;
    }

    multiply(v: Vec3 | number) {
        if (v instanceof Vec3) Vec3Func.multiply(this, this, v);
        else Vec3Func.scale(this, this, v);
        return this;
    }

    divide(v: Vec3 | number) {
        if (v instanceof Vec3) Vec3Func.divide(this, this, v);
        else Vec3Func.scale(this, this, 1 / v);
        return this;
    }

    inverse(v = this) {
        Vec3Func.inverse(this, v);
        return this;
    }

    // Can't use 'length' as Array.prototype uses it
    len() {
        return Vec3Func.length(this);
    }

    distance(v?: Vec3) {
        if (v) return Vec3Func.distance(this, v);
        else return Vec3Func.length(this);
    }

    squaredLen() {
        return this.squaredDistance();
    }

    squaredDistance(v?: Vec3) {
        if (v) return Vec3Func.squaredDistance(this, v);
        else return Vec3Func.squaredLength(this);
    }

    negate(v = this) {
        Vec3Func.negate(this, v);
        return this;
    }

    cross(va: Vec3, vb: Vec3) {
        Vec3Func.cross(this, va, vb);
        return this;
    }

    scale(v: number) {
        Vec3Func.scale(this, this, v);
        return this;
    }

    normalize() {
        Vec3Func.normalize(this, this);
        return this;
    }

    dot(v: Vec3) {
        return Vec3Func.dot(this, v);
    }

    equals(v: Vec3) {
        return Vec3Func.exactEquals(this, v);
    }

    applyMatrix4(mat4: Mat4) {
        Vec3Func.transformMat4(this, this, mat4);
        return this;
    }

    applyQuaternion(q: Quat) {
        Vec3Func.transformQuat(this, this, q);
        return this;
    }

    angle(v: Vec3) {
        return Vec3Func.angle(this, v);
    }

    lerp(v: Vec3, t: number) {
        Vec3Func.lerp(this, this, v, t);
        return this;
    }

    clone() {
        return new Vec3(this[0], this[1], this[2]);
    }

    fromArray(a: number[], o: number = 0) {
		this[0] = a[o];
		this[1] = a[o + 1];
		this[2] = a[o + 2];
		return this;
    }

	toArray(a: Float32Array | number[] = [], o: number = 0) {
		a[o] = this[0];
		a[o + 1] = this[1];
		a[o + 2] = this[2];
		return a;
	}

    transformDirection(mat4: Mat4) {
        const x = this[0];
        const y = this[1];
        const z = this[2];

        this[0] = mat4[0] * x + mat4[4] * y + mat4[8] * z;
        this[1] = mat4[1] * x + mat4[5] * y + mat4[9] * z;
        this[2] = mat4[2] * x + mat4[6] * y + mat4[10] * z;

        return this.normalize();
    }
}
