export const validate = (schema, payload) => {
    const result = schema.safeParse(payload);
    if (!result.success) {
        return {
            success: false,
            errors: result.error.issues
        };
    }
    return {
        success: true,
        data: result.data
    };
};