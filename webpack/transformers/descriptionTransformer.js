const ts = require('typescript');

/**
 * The name of the decorator that identifies a widget class.
 */
const WIDGET_CLASS_DECORATOR = 'TWWidgetDefinition';

/**
 * The name of the decorator that identifies a property.
 */
const WIDGET_PROPERRTY_DECORATOR = 'property';

/**
 * The name of the decorator that identifies an event.
 */
const WIDGET_EVENT_DECORATOR = 'event';

/**
 * The name of the decorator that identifies a service.
 */
const WIDGET_SERVICE_DECORATOR = 'service';

/**
 * The name of the decorator that supplioes descriptions.
 */
const DESCRIPTION_DECORATOR = 'description';

/**
 * A typescript transformer that automatically generates description decorators from JSDoc tags.
 * This transformer must be used in the `before` phase.
 *
 * When used, a description decorator will be generated for a property or method that:
 *  - has either the `@property`, `@event` or `@service` decorator applied to it
 *  - is declared in a class that has the `@TWWidgetDefinition` decorator applied to it
 *
 * It will also generate a description decorator for any class that has the `@TWWidgetDefinition` decorator applied to it.
 *
 * If a description decorator is already specified for an element, the transformer will skip creating an additional
 * description decorator for that element.
 *
 * The transformer will take the text of the first JSDoc tag that refers to each matching element and
 * supply it as the argument for the description decorator.
 */
class DescriptionTransformer {
    /**
     *
     * @param {ts.TransformationContext} context The transformation context.
     */
    constructor(context) {
        this.context = context;
    }

    /**
     * @type {ts.TransformationContext} The transformation context.
     */
    context;

    /**
     * Set to `true` if the file processed by this transformer is an IDE file.
     */
    isIDEFile = false;

    /**
     * Checks whether the given node has a decorator or decorator factory with the given name.
     * @param {string} name         The name of the decorator to find.
     * @param {ts.Node} node        The node in which to search.
     * @return {boolean}            `true` if the decorator was found, `false` otherwise.
     */
    hasDecoratorNamed(name, node) {
        if (!node.decorators) return false;

        // Getting the decorator name depends on whether the decorator is applied directly or via a
        // decorator factory.
        for (const decorator of node.decorators) {
            // In a decorator factory, the decorator itself is the result of invoking
            // the decorator factory function so it doesn't technically have a name; in this case the name
            // of the decorator factory function is considered to be the decorator name.
            if (decorator.expression.kind == ts.SyntaxKind.CallExpression) {
                /** @type {ts.CallExpression} */ const callExpression = decorator.expression;
                if (
                    callExpression.expression.kind == ts.SyntaxKind.Identifier &&
                    callExpression.expression.text == name
                ) {
                    return true;
                }
            } else if (decorator.expression.kind == ts.SyntaxKind.Identifier) {
                /** @type {ts.Identifier} */ const identifierExpression = decorator.expression;
                if (identifierExpression.text == name) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Visits the given node. This method will be invoked for all nodes in the file.
     * @param {ts.Node} node        The node to visit.
     * @return {ts.Node}            The visited node, or a new node that will replace it.
     */
    visit(node) {
        // The description decorator only makes sense for IDE files
        // An IDE file is identified from its imports - it must import its Thingworx specific
        // decorators from the widgetIDESupport package
        if (node.kind == ts.SyntaxKind.ImportDeclaration) {
            /** @type {ts.ImportDeclaration} */ const importNode = node;

            /** @type {ts.StringLiteral} */ const module = importNode.moduleSpecifier;
            if (module.text == 'typescriptwebpacksupport/widgetIDESupport') {
                this.isIDEFile = true;
            }
        }

        // There are three kinds of nodes that are relevant to this transformer that will be handled here.

        // The first kind is a class declaration node
        if (node.kind == ts.SyntaxKind.ClassDeclaration && this.isIDEFile) {
            // Classes must have a `@TWWidgetDefinition` decorator and must not have a `@description` decorator in order to be considered
            if (
                this.hasDecoratorNamed(WIDGET_CLASS_DECORATOR, node) &&
                !this.hasDecoratorNamed(DESCRIPTION_DECORATOR, node)
            ) {
                // First visit the class members
                const replacementNode = ts.visitEachChild(
                    node,
                    (node) => this.visit(node),
                    this.context,
                );

                // Then return a replacement
                const classNode = this.addDescriptionDecoratorToNode(replacementNode, node);

                return classNode;
            }
        }
        // The second kind is a property declaration node
        else if (node.kind == ts.SyntaxKind.PropertyDeclaration && this.isIDEFile) {
            // Members must be part of a class that has the `@TWWidgetDefinition` decorator
            // and must not have the `@description` decorator themselves
            if (
                node.parent.kind == ts.SyntaxKind.ClassDeclaration &&
                (this.hasDecoratorNamed(WIDGET_PROPERRTY_DECORATOR, node) ||
                    this.hasDecoratorNamed(WIDGET_EVENT_DECORATOR, node) ||
                    this.hasDecoratorNamed(WIDGET_SERVICE_DECORATOR, node))
            ) {
                if (!this.hasDecoratorNamed(DESCRIPTION_DECORATOR, node)) {
                    return this.addDescriptionDecoratorToNode(node);
                }
            }
        }
        // The final kind is a method declaration node
        else if (node.kind == ts.SyntaxKind.MethodDeclaration && this.isIDEFile) {
            // Members must be part of a class that has the `@TWWidgetDefinition` decorator
            // and must not have the `@description` decorator themselves
            if (
                node.parent.kind == ts.SyntaxKind.ClassDeclaration &&
                this.hasDecoratorNamed(WIDGET_SERVICE_DECORATOR, node)
            ) {
                if (!this.hasDecoratorNamed(DESCRIPTION_DECORATOR, node)) {
                    return this.addDescriptionDecoratorToNode(node);
                }
            }
        }

        return ts.visitEachChild(node, (node) => this.visit(node), this.context);
    }

    /**
     * Adds the description decorator to the given node.
     * @param {ts.Node} node            The node to add the description decorator to.
     * @param {ts.Node} originalNode    If the target is node is transformed, and JSDoc tags cannot be obtained from it,
     *                                  this should be set to the original untransformed node from which the documentation
     *                                  can be obtained.
     * @returns {ts.Node}               A transformed node containing the added description decorator.
     */
    addDescriptionDecoratorToNode(node, originalNode) {
        // The description is the JSDoc associated to the node, if there is one
        const documentation = ts.getJSDocCommentsAndTags(originalNode || node);
        if (!documentation.length) return node;

        let description = '';

        // Get the first documentation node and use it as the description
        if (documentation.length) {
            for (const documentationNode of documentation) {
                if (documentationNode.kind == ts.SyntaxKind.JSDocComment) {
                    const comment = documentationNode.comment || '';
                    if (typeof comment != 'string') {
                        description = comment.reduce((acc, val) => acc + val.text, '');
                    } else {
                        description = comment;
                    }
                    break;
                }
            }
        }

        // Return if the description is empty
        if (!description) return node;

        // The description decorator is a decorator factory, so a call expression has to be created for it
        const descriptionCall = this.context.factory.createCallExpression(
            this.context.factory.createIdentifier(DESCRIPTION_DECORATOR),
            undefined,
            [this.context.factory.createStringLiteral(description, false)],
        );

        const decorator = this.context.factory.createDecorator(descriptionCall);

        switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                /** @type {ts.ClassDeclaration} */ const classNode = node;
                return this.context.factory.updateClassDeclaration(
                    classNode,
                    [decorator].concat(classNode.decorators || []),
                    classNode.modifiers,
                    classNode.name,
                    classNode.typeParameters,
                    classNode.heritageClauses,
                    classNode.members,
                );
            case ts.SyntaxKind.PropertyDeclaration:
                /** @type {ts.PropertyDeclaration} */ const propNode = node;
                return this.context.factory.updatePropertyDeclaration(
                    propNode,
                    [decorator].concat(propNode.decorators || []),
                    propNode.modifiers,
                    propNode.name,
                    propNode.questionToken || propNode.exclamationToken,
                    propNode.type,
                    propNode.initializer,
                );
            case ts.SyntaxKind.MethodDeclaration:
                /** @type {ts.MethodDeclaration} */ const methodNode = node;
                return this.context.factory.updateMethodDeclaration(
                    methodNode,
                    [decorator].concat(methodNode.decorators || []),
                    methodNode.modifiers,
                    methodNode.asteriskToken,
                    methodNode.name,
                    methodNode.questionToken,
                    methodNode.typeParameters,
                    methodNode.parameters,
                    methodNode.type,
                    methodNode.body,
                );
            default:
                return node;
        }
    }
}

/**
 * Returns a description transformer function.
 * @return      A transformer function.
 */
function DescriptionTransformerFactory() {
    // Note that this function is currently useless, but can be used in the future to specify construction arguments
    return function DescriptionTransformerFunction(
        /** @type {ts.TransformationContext} */ context,
    ) {
        const transformer = new DescriptionTransformer(context);

        return (/** @type {ts.Node} */ node) =>
            ts.visitNode(node, (node) => transformer.visit(node));
    };
}

exports.DescriptionTransformer = DescriptionTransformer;
exports.DescriptionTransformerFactory = DescriptionTransformerFactory;
