import static org.junit.Assert.assertEquals;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

public class TestXPathEvaluator {
	static WebDriver driver;
	static WebElement query;
	static WebElement submitQuery;
	static WebElement result;

	/*
	 * Induce a sleep time for demonstration to slow down the tests.
	 */
	static long sleepTime = 0; // 750;

	@BeforeClass
	public static void oneTimeSetUp() throws InterruptedException {
		driver = new FirefoxDriver();
		driver.get("file:///E:/college/sophomore/spring/CSSE433/project/csse433-xpath-evaluator/index.html");
		Thread.sleep(sleepTime);
		query = driver.findElement(By.id("xpath"));
		submitQuery = driver.findElement(By.id("evaluate"));
		result = driver.findElement(By.className("results"));

		driver.findElement(By.id("loadXml")).click();
		Thread.sleep(sleepTime);
		WebElement xmlBox = driver.findElement(By.id("xmlData"));
		xmlBox.clear();
		xmlBox.sendKeys("<bookstore specialty=\"novel\"><book style=\"autobiography\"><author><first-name>Joe</first-name><last-name>Bob</last-name><award>Trenton Literary Review Honorable Mention</award></author><price>12</price></book><book style=\"textbook\"><author><first-name>Mary</first-name><last-name>Bob</last-name><publication>Selected Short Stories of<first-name>Mary</first-name><last-name>Bob</last-name></publication></author><editor><first-name>Britney</first-name><last-name>Bob</last-name></editor><price>55</price></book><magazine style=\"glossy\" frequency=\"monthly\"><price>2.50</price><subscription price=\"24\" per=\"year\"/></magazine><book style=\"novel\" id=\"myfave\"><author><first-name>Toni</first-name><last-name>Bob</last-name><degree from=\"Trenton U\">B.A.</degree><degree from=\"Harvard\">Ph.D.</degree><award>Pulitzer</award><publication>Still in Trenton</publication><publication>Trenton Forever</publication></author><price intl=\"Canada\" exchange=\"0.7\">6.50</price><excerpt><p>It was a dark and stormy night.</p><p>But then all nights in Trenton seem dark andstormy to someone who has gone through what<emph>I</emph> have.</p><definition-list><term>Trenton</term><definition>misery</definition></definition-list></excerpt></book></bookstore>");
		driver.findElement(By.className("load")).click();
		Thread.sleep(sleepTime);
	}

	@Before
	public void setUp() throws Exception {

	}

	/*
	 * XPath Examples from:
	 * http://msdn.microsoft.com/en-us/library/ms256086.aspx
	 */

	/*
	 * All node elements within the current context.
	 */
	@Ignore
	@Test
	public void testDotSlashNode() throws Exception {
		executeQuery("./author");
		assertEquals("[]", result.getText());

		executeQuery("./bookstore");
		assertEquals("[]", result.getText()); // TODO everything
	}

	/*
	 * All node elements within the current context.
	 */
	@Ignore
	@Test
	public void testNode() throws Exception {
		executeQuery("author");
		assertEquals("[]", result.getText());

		executeQuery("bookstore");
		assertEquals("[]", result.getText()); // TODO everything
	}

	/*
	 * All <first.name> elements within the current context.
	 */
	@Ignore
	@Test
	public void testNodeDotNode() throws Exception {
		executeQuery("first.name");
		assertEquals("[]", result.getText());
	}

	/*
	 * The document element (<bookstore>) of this document.
	 */
	@Ignore
	@Test
	public void testRootNode() throws Exception {
		executeQuery("/bookstore");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements in the document.
	 */
	@Ignore
	@Test
	public void testDoubleSlashNode() throws Exception {
		executeQuery("//author");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <book> elements whose style attribute value is equal to the specialty
	 * attribute value of the <bookstore> element at the root of the document.
	 */
	@Ignore
	@Test
	public void testNodeWithParameters() throws Exception {
		executeQuery("book[/bookstore/@specialty=@style]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <first-name> elements that are children of an <author> element.
	 */
	@Ignore
	@Test
	public void testNodeSlashNode() throws Exception {
		executeQuery("author/first-name");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <title> elements one or more levels deep in the <bookstore> element
	 * (arbitrary descendants). Note that this is different from the expression
	 * in the next row.
	 */
	@Ignore
	@Test
	public void testNodeDoubleSlashNode() throws Exception {
		executeQuery("bookstore//title");
		assertEquals("[]", result.getText());
	}

	/*
	 * All node elements that are grandchildren of node elements.
	 */
	@Ignore
	@Test
	public void testNodeAsterickNode() throws Exception {
		executeQuery("bookstore/*/title");
		assertEquals("[]", result.getText());

		executeQuery("book/*/last-name");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <emph> elements anywhere inside <excerpt> children of <book>
	 * elements, anywhere inside the <bookstore> element.
	 */
	@Ignore
	@Test
	public void testNodeDoubleSlashNodeSlashNodeDoubleSlashNode()
			throws Exception {
		executeQuery("bookstore//book/excerpt//emph");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <title> elements one or more levels deep in the current context. Note
	 * that this situation is essentially the only one in which the period
	 * notation is required.
	 */
	@Ignore
	@Test
	public void testDotDoubleSlashNode() throws Exception {
		executeQuery(".//title");
		assertEquals("[]", result.getText());
	}

	/*
	 * All elements that are the children of <author> elements.
	 */
	@Ignore
	@Test
	public void testNodeAsterick() throws Exception {
		executeQuery("author/*");
		assertEquals("[]", result.getText());
	}

	/*
	 * All grandchildren elements of the current context.
	 */
	@Ignore
	@Test
	public void testAsterickSlashAsterick() throws Exception {
		executeQuery("*/*");
		assertEquals("[]", result.getText());
	}

	/*
	 * All elements with the specialty attribute.
	 */
	@Ignore
	@Test
	public void testAsterickAttribute() throws Exception {
		executeQuery("*[@specialty]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The style attribute of the current context.
	 */
	@Ignore
	@Test
	public void testAttribute() throws Exception {
		executeQuery("@style");
		assertEquals("[]", result.getText());
	}

	/*
	 * The exchange attribute on <price> elements within the current context.
	 */
	@Ignore
	@Test
	public void testNodeSlashAttribute() throws Exception {
		executeQuery("price/@exchange");
		assertEquals("[]", result.getText());

		executeQuery("book/@style");
		assertEquals("[]", result.getText());
	}

	/*
	 * Returns an empty node set, because attributes do not contain element
	 * children. This expression is allowed by the XML Path Language (XPath)
	 * grammar, but is not strictly valid.
	 */
	@Ignore
	@Test
	public void testNodeSlashAttributeSlashNode() throws Exception {
		executeQuery("price/@exchange/total");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <book> elements with style attributes, of the current context.
	 */
	@Ignore
	@Test
	public void testNodeAttribute() throws Exception {
		executeQuery("book[@style]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All attributes of the current element context.
	 */
	@Ignore
	@Test
	public void testAttributeAsterick() throws Exception {
		executeQuery("@*");
		assertEquals("[]", result.getText());
	}

	/*
	 * The first <author> element in the current context node.
	 */
	@Ignore
	@Test
	public void testNodeSelector() throws Exception {
		executeQuery("author[1]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The third <author> element that has a <first-name> child.
	 */
	@Ignore
	@Test
	public void testDoubleSelector() throws Exception {
		executeQuery("author[first-name][3]");
		assertEquals("[]", result.getText());

		executeQuery("author[degree][award]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The <book> element from the my namespace.
	 */
	@Ignore
	@Test
	public void testNamespaceNode() throws Exception {
		executeQuery("my:book");
		assertEquals("[]", result.getText());
	}

	/*
	 * All elements from the my namespace.
	 */
	@Ignore
	@Test
	public void testNamespaceAsterick() throws Exception {
		executeQuery("my:*");
		assertEquals("[]", result.getText());
	}

	/*
	 * All attributes from the my namespace (this does not include unqualified
	 * attributes on elements from the my namespace).
	 */
	@Ignore
	@Test
	public void testAttributeNamespaceAsterick() throws Exception {
		executeQuery("@my:*");
		assertEquals("[]", result.getText());
	}

	/*
	 * All attributes from the my namespace (this does not include unqualified
	 * attributes on elements from the my namespace).
	 */
	@Ignore
	@Test
	public void testNodeSlashSelector() throws Exception {
		executeQuery("x/y[1]");
		assertEquals("[]", result.getText());
	}

	/*
	 * ] The first <y> child of each <x>.
	 */
	@Ignore
	@Test
	public void testNodeSlashSelectorPosition() throws Exception {
		executeQuery("x/y[position() = 1]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The first <y> from the entire set of <y> children of <x> elements.
	 */
	@Ignore
	@Test
	public void testGroupingSelector() throws Exception {
		executeQuery("(x/y)[1]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The second <y> child of the first <x>.
	 */
	@Ignore
	@Test
	public void testNodeSelectorSlashNodeSelector() throws Exception {
		executeQuery("x[1]/y[2]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The last <book> element of the current context node.
	 */
	@Ignore
	@Test
	public void testNodeSelectorLast() throws Exception {
		executeQuery("book[last()]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The last <author> child of each <book> element of the current context
	 * node.
	 */
	@Ignore
	@Test
	public void testNodeSlashNodeSelectorLast() throws Exception {
		executeQuery("book/author[last()]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The last <author> element from the entire set of <author> children of
	 * <book> elements of the current context node.
	 */
	@Ignore
	@Test
	public void testGroupingSelectorLast() throws Exception {
		executeQuery("(book/author)[last()]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <book> elements that contain at least one <excerpt> element child.
	 */
	@Ignore
	@Test
	public void testNodeSelectorNode() throws Exception {
		executeQuery("book[excerpt]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <title> elements that are children of <book> elements that also
	 * contain at least one <excerpt> element child.
	 */
	@Ignore
	@Test
	public void testNodeSelectorNodeSlashNode() throws Exception {
		executeQuery("book[excerpt]/title");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements that contain at least one <degree> element child,
	 * and that are children of <book> elements that also contain at least one
	 * <excerpt> element.
	 */
	@Ignore
	@Test
	public void testNodeSelectorNodeSlashNodeSelectorNode() throws Exception {
		executeQuery("book[excerpt]/author[degree]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <book> elements that contain <author> children that in turn contain
	 * at least one <degree> child.
	 */
	@Ignore
	@Test
	public void testNodeSelectorNodeSlashNodeEndSelector() throws Exception {
		executeQuery("book[author/degree]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements that contain at least one <degree> element child
	 * and at least one <award> element child.
	 */
	@Ignore
	@Test
	public void testNodeSelectorAnd() throws Exception {
		executeQuery("author[degree and award]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements that contain at least one <degree> or <award> and
	 * at least one <publication> as the children
	 */
	@Ignore
	@Test
	public void testNodeSelectorGroupOrAnd() throws Exception {
		executeQuery("author[(degree or award) and publication]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements that contain at least one <degree> element child
	 * and that contain no <publication> element children.
	 */
	@Ignore
	@Test
	public void testNodeSelectorAndNot() throws Exception {
		executeQuery("author[degree and not(publication)]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements that contain at least one <publication> element
	 * child and contain neither <degree> nor <award> element children.
	 */
	@Ignore
	@Test
	public void testNodeSelectorNotGroupOrAnd() throws Exception {
		executeQuery("author[not(degree or award) and publication]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements that contain at least one <last-name> element child
	 * with the value Bob.
	 */
	@Ignore
	@Test
	public void testNodeSelectorValue() throws Exception {
		executeQuery("author[last-name = \"Bob\"]");
		assertEquals("[]", result.getText());

		executeQuery("author[first-name = \"Bob\"]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements where the first <last-name> child element has the
	 * value Bob. Note that this is equivalent to the expression in the next
	 * row.
	 */
	@Ignore
	@Test
	public void testNodeSelectorSelectorValue() throws Exception {
		executeQuery("author[last-name[1] = \"Bob\"]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements where the first <last-name> child element has the
	 * value Bob.
	 */
	@Ignore
	@Test
	public void testNodeSelectorSelectorPositionValue() throws Exception {
		executeQuery("author[last-name [position()=1]=\"Bob\"]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <degree> elements where the from attribute is not equal to "Harvard".
	 */
	@Ignore
	@Test
	public void testNodeSelectorAttributeValue() throws Exception {
		executeQuery("degree[@from != \"Harvard\"]");
		assertEquals("[]", result.getText());

		executeQuery("price[@intl = \"Canada\"]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements whose value is Matthew Bob.
	 */
	@Ignore
	@Test
	public void testNodeSelectorDotValue() throws Exception {
		executeQuery("author[. = \"Matthew Bob\"]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements that contain a <last-name> child element whose
	 * value is Bob, and a <price> sibling element whose value is greater than
	 * 50.
	 */
	@Ignore
	@Test
	public void testNodeSelectorAndValue() throws Exception {
		executeQuery("author[last-name = \"Bob\" and ../price &gt; 50]");
		assertEquals("[]", result.getText());

		executeQuery("author[last-name = \"Bob\" and first-name = \"Joe\"]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The first three books (1, 2, 3).
	 */
	@Ignore
	@Test
	public void testNodeSelectorPositionValue() throws Exception {
		executeQuery("book[position() &lt;=3]");
		assertEquals("[]", result.getText());

		executeQuery("degree[position() &lt; 3]");
		assertEquals("[]", result.getText());
	}

	/*
	 * All <author> elements that do no contain <last-name> child elements with
	 * the value Bob.
	 */
	@Ignore
	@Test
	public void testNodeSelectorNotValue() throws Exception {
		executeQuery("author[not(last-name = \"Bob\"]");
		assertEquals("[]", result.getText());
	}

	/*
	 * all author elements containing any child element whose value is Bob.
	 */
	@Ignore
	@Test
	public void testNodeSelectorAsterickValue() throws Exception {
		executeQuery("author[* = \"Bob\"");
		assertEquals("[]", result.getText());
	}

	/*
	 * The text node in each <p> element in the context node.
	 */
	@Ignore
	@Test
	public void testNodeSlashText() throws Exception {
		executeQuery("p/text()");
		assertEquals("[]", result.getText());
	}

	/*
	 * The second text node in each <p> element in the context node.
	 */
	@Ignore
	@Test
	public void testNodeSlashTextSelector() throws Exception {
		executeQuery("p/text()[2]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The nearest <book> ancestor of the context node.
	 */
	@Ignore
	@Test
	public void testAncestorSelector() throws Exception {
		executeQuery("ancestor::book[1]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The nearest <book> ancestor of the context node and this <book> element
	 * has an <author> element as its child.
	 */
	@Ignore
	@Test
	public void testAncestorSelectorSelector() throws Exception {
		executeQuery("ancestor::book[author][1]");
		assertEquals("[]", result.getText());
	}

	/*
	 * The nearest <author> ancestor in the current context and this <author>
	 * element is a child of a <book> element.
	 */
	@Ignore
	@Test
	public void testAncestorAncestorSelector() throws Exception {
		executeQuery("ancestor::author[parent::book][1]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Test examples from http://msdn.microsoft.com/en-us/library/ms256236.aspx
	 */

	/*
	 * Select all the children of the context node, whatever their node type.
	 */
	@Ignore
	@Test
	public void testChildNode() throws Exception {
		executeQuery("child::node()");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the name attribute of the context node.
	 */
	@Ignore
	@Test
	public void testAttributeLocation() throws Exception {
		executeQuery("attribute::name");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select all the attributes of the context node.
	 */
	@Ignore
	@Test
	public void testAttributeLocationAsterick() throws Exception {
		executeQuery("ancestor::*");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the <para> element descendants of the context node.
	 */
	@Ignore
	@Test
	public void testDescendant() throws Exception {
		executeQuery("descendant::para");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select all <div> ancestors of the context node.
	 */
	@Ignore
	@Test
	public void testAncestor() throws Exception {
		executeQuery("ancestor::div");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the <div> ancestors of the context node and, if the context node
	 * is a <div> element, select the context node as well.
	 */
	@Ignore
	@Test
	public void testAncestorOrSelf() throws Exception {
		executeQuery("ancestor-or-self::div");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the <para> element descendants of the context node and, if the
	 * context node is a <para> element, select the context node as well.
	 */
	@Ignore
	@Test
	public void testDescendantOrSelf() throws Exception {
		executeQuery("descendant-of-self::para");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the context node if it is a <para> element; otherwise select
	 * nothing.
	 */
	@Ignore
	@Test
	public void testSelf() throws Exception {
		executeQuery("self::para");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the <para> element descendants of the <chapter> element children
	 * of the context node.
	 */
	@Ignore
	@Test
	public void testChildSlashDescendant() throws Exception {
		executeQuery("child::chapter/descendant::para");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select all <para> grandchildren of the context node.
	 */
	@Ignore
	@Test
	public void testChildAsterickSlashChild() throws Exception {
		executeQuery("child::*/child::para");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the document root (which is always the parent of the document
	 * element).
	 */
	@Ignore
	@Test
	public void testRoot() throws Exception {
		executeQuery("/");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select all the <para> elements in the same document as the context node.
	 */
	@Ignore
	@Test
	public void testRootDescendant() throws Exception {
		executeQuery("/descendant::para");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select all the <item> elements that have an <olist> parent and that are
	 * in the same document as the context node.
	 */
	@Ignore
	@Test
	public void testRootDescendantSlashChild() throws Exception {
		executeQuery("/descendant::olist/child::item");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the first <para> child of the context node.
	 */
	@Ignore
	@Test
	public void testChildSelectorPosition() throws Exception {
		executeQuery("child::para[position()=1]");
		assertEquals("[]", result.getText());

		executeQuery("child::para[position()&gt;1]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the last <para> child of the context node.
	 */
	@Ignore
	@Test
	public void testChildSelectorPositionLast() throws Exception {
		executeQuery("child::para[position()=last()");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the next-to-last <para> child of the context node.
	 */
	@Ignore
	@Test
	public void testChildSelectorPositionLastMinus1() throws Exception {
		executeQuery("child::para[position()=last()-1");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the forty-second <figure> element in the document.
	 */
	@Ignore
	@Test
	public void testRootDescendantPosition() throws Exception {
		executeQuery("/descendant::figure[position()=42]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the second <section> element contained in the fifth <chapter>
	 * element of the <doc> document element.
	 */
	@Ignore
	@Test
	public void testRootChildSlashChildPosition() throws Exception {
		executeQuery("/child::doc/child::chapter[position()=5]");
		assertEquals("[]", result.getText());

		executeQuery("/child::selction[position()=2]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select all <para> children of the context node that have a typeattribute
	 * with the value "warning".
	 */
	@Ignore
	@Test
	public void testChildSelectorAttributeValue() throws Exception {
		executeQuery("child::para[attribute::type=\"warning\"");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the fifth <para> child of the context node that has a
	 * typeattribute with the value "warning".
	 */
	@Ignore
	@Test
	public void testChildSelectorAttributeValueSelectorPosition()
			throws Exception {
		executeQuery("child::para[attribute::type=\"warning\"][position()=5]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the fifth <para> child of the context node if that child has a
	 * type attribute with the value "warning".
	 */
	@Ignore
	@Test
	public void testChildSelectorPositionSelectorAttributeValue()
			throws Exception {
		executeQuery("child::para[position()=5][attribute::type=\"warning\"]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the <chapter> children of the context node that have one or more
	 * <title> children with string value equal to "Introduction".
	 */
	@Ignore
	@Test
	public void testChildSelectorChildValue() throws Exception {
		executeQuery("child::chapter[child::title=\"Introduction\"]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the <chapter> children of the context node that have one or more
	 * <title> children.
	 */
	@Ignore
	@Test
	public void testChildSelectorChild() throws Exception {
		executeQuery("child::chapter[child::title]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the <chapter> and <appendix> children of the context node.
	 */
	@Ignore
	@Test
	public void testChildAsterickSelectorSelfOrSelf() throws Exception {
		executeQuery("child::*[self::chapter or self::appendix]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Select the last <chapter> or <appendix> child of the context node.
	 */
	@Ignore
	@Test
	public void testChildAsterickSelectorSelfOrSelfSelectorPositionLast()
			throws Exception {
		executeQuery("child::*[self::chapter or self::appendix][position()=last()]");
		assertEquals("[]", result.getText());
	}

	/*
	 * Testing Misc Items
	 */
	@Test
	public void testEmpty() throws Exception {
		executeQuery("//Website");
		assertEquals("[]", result.getText());
	}

	@Test
	public void testSingleSlash() throws Exception {
		executeQuery("/book");
		assertEquals("[]", result.getText());
	}

	@Test
	public void testSingleSlashMultiple() throws Exception {
		executeQuery("/bookstore/book/author/test");
		assertEquals("[]", result.getText());
	}

	@Test
	public void testSingleSlashAttribute() throws Exception {
		executeQuery("/bookstore/@specialty");
		assertEquals("\"novel\"", result.getText());
	}

	@Ignore
	@Test
	public void testSingleSlashMultipleAttribute() throws Exception {
		executeQuery("/bookstore/book/@style");
		assertEquals("[\"autobiography\", \"textbook\", \"novel\"]",
				result.getText());
	}

	@Ignore
	@Test
	public void testDoubleSlash() throws Exception {
		executeQuery("//book");
		assertEquals("[]", result.getText());
	}

	@After
	public void tearDown() throws Exception {

	}

	@AfterClass
	public static void oneTimeTearDown() {
		driver.quit();
	}

	public void executeQuery(String queryString) throws InterruptedException {
		query.clear();
		query.sendKeys(queryString);
		Thread.sleep(sleepTime / 2);
		submitQuery.click();
		Thread.sleep(sleepTime);
	}
}
